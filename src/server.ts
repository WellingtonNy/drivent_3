import app, { init } from '@/app';

//4000-->5000
const port = +process.env.PORT || 4000;


init().then(() => {
  app.listen(port, () => {
    /* eslint-disable-next-line no-console */
    console.log(`Server is listening on port ${port}.`);
  });
});
