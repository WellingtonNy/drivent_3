import supertest from "supertest";
import faker from "@faker-js/faker";
import app, { init } from "@/app";
import httpStatus from "http-status";
import * as jwt from 'jsonwebtoken'
import { createEnrollmentWithAddress, createUser, createTicket, createCTicket, criarHotel, deletarHotel, criarQuarto } from "../factories";
import { cleanDb, generateValidToken } from "../helpers";


const server = supertest(app)

beforeAll(async () => {
    await init()
    await cleanDb()
})

beforeEach(async () => {
    await cleanDb()
})



describe('GET /hotels', () => {



    it('401 sem token fornecido', async () => {
        const resposta = await server.get('/hotels')
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('404 sem ticket para o usuario', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        await createEnrollmentWithAddress(usuario)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('401 sem sessao para o token', async () => {
        const usuarioFora = await createUser();
        const token = jwt.sign({ userId: usuarioFora.id }, process.env.JWT_SECRET)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('401 token fornecido invalido', async () => {
        const token = faker.lorem.word();
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('404 sem inscrissao para o usuario', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('402 ticket não inclue hotel', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const ticketType = await createCTicket(false, false)
        await createTicket(inscricao.id, ticketType.id, 'PAID')
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('404 sem hotel', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('402 tipo de ticket remoto', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(true, false)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('402 ticket ja reservado', async () => {
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'RESERVED')
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('200 hotel data', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.OK);
        expect(resposta.body).toEqual([
            {
                id: hotel.id,
                name: hotel.name,
                image: hotel.image,
                createdAt: hotel.createdAt.toISOString(),
                updatedAt: hotel.updatedAt.toISOString(),
            }
        ])
    })

})



describe('GET /hotels/:id', () => {



    it('401 sem token fornecido', async () => {
        const hotel = await criarHotel()
        const resposta = await server.get(`/hotels/${hotel.id}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('401 sem sessao para o token', async () => {
        const hotel = await criarHotel()
        const usuarioFora = await createUser()
        const token = jwt.sign({ userId: usuarioFora.id }, process.env.JWT_SECRET)
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('401 token fornecido invalido', async () => {
        const hotel = await criarHotel()
        const token = faker.lorem.word()
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('402 ticket n inclui hotel', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, false)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('404 sem cadastro de usuario', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)

        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('404 ticket sem hotel', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario);
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        await deletarHotel(hotel.id)
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('402 ticket ja reservado', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'RESERVED')

        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('402 ticket modalidade remota', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(true, false)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('200 ticket data', async () => {
        const hotel = await criarHotel()
        const quarto = await criarQuarto(hotel.id)
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        const inscricao = await createEnrollmentWithAddress(usuario)
        const tipoTicket = await createCTicket(false, true)
        await createTicket(inscricao.id, tipoTicket.id, 'PAID')
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.OK)
        expect(resposta.body).toEqual({
            id: hotel.id,
            name: hotel.name,
            image: hotel.image,
            createdAt: hotel.createdAt.toISOString(),
            updatedAt: hotel.updatedAt.toISOString(),
            Rooms: [
                {
                    id: quarto.id,
                    name: quarto.name,
                    capacity: quarto.capacity,
                    hotelId: quarto.hotelId,
                    createdAt: quarto.createdAt.toISOString(),
                    updatedAt: quarto.updatedAt.toISOString(),
                }
            ]
        })
    })



    it('404 sem ticket para o usuario', async () => {
        const hotel = await criarHotel()
        const usuario = await createUser()
        const token = await generateValidToken(usuario)
        await createEnrollmentWithAddress(usuario)
        const resposta = await server.get(`/hotels/${hotel.id}`).set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })
})