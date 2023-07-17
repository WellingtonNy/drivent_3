import supertest from "supertest";
import faker from "@faker-js/faker";
import app, { init } from "@/app";
import httpStatus from "http-status";
import * as jwt from 'jsonwebtoken'
import { createEnrollmentWithAddress, createUser, createTicketType, hotelT } from "../factories";
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



    it('sem token-401', async () => {
        const resposta = await server.get('/hotels');
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('sem inscrição para o token-404', async () => {
        const usuario = await createUser();
        const token = await generateValidToken(usuario)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('sem ticket-404', async () => {
        const usuario = await createUser()
        await createEnrollmentWithAddress(usuario)
        const token = await generateValidToken(usuario)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(resposta.status).toBe(httpStatus.NOT_FOUND)
    })



    it('token invalido-401', async () => {
        const token = faker.lorem.word()
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('token da sessao-401', async () => {
        const usuario = await createUser()
        const token = jwt.sign({ userId: usuario.id }, process.env.JWT_SECRET)
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.UNAUTHORIZED)
    })



    it('modalidade remota-402', async () => {
        const usuario = await createUser()
        await createEnrollmentWithAddress(usuario)
        const token = await generateValidToken(usuario)
        const tipoTicket = await createTicketType()
        await server.post('/tickets').send({ ticketTypeId: tipoTicket.id }).set('Authorization', `Bearer ${token}`)
        await hotelT()
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED);
    })



    it('sem quarto-402', async () => {
        const usuario = await createUser()
        await createEnrollmentWithAddress(usuario)
        const token = await generateValidToken(usuario)
        const tipoTicket = await createTicketType()
        await server.post('/tickets').send({ ticketTypeId: tipoTicket.id }).set('Authorization', `Bearer ${token}`)
        await hotelT();
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`)
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })



    it('ticket não pago-402', async () => {
        const usuario = await createUser()
        await createEnrollmentWithAddress(usuario)
        const token = await generateValidToken(usuario)
        const tipoTicket = await createTicketType()
        await server.post('/tickets').send({ ticketTypeId: tipoTicket.id }).set('Authorization', `Bearer ${token}`)
        await hotelT()
        const resposta = await server.get('/hotels').set('Authorization', `Bearer ${token}`);
        expect(resposta.status).toBe(httpStatus.PAYMENT_REQUIRED)
    })
})