# SpaceOrbit-server

## Running without Docker

Create `.env` file with the following content:

```bash
DATABASE_URL="file:./data/dev.db"

JWT_ACCESS_SECRET=SECRET123
JWT_REFRESH_SECRET=ANOTHER_SECRET123
```

<br/>

```bash
npm install
```

```bash
npm run migrate
```

```bash
npm run dev
```

Server available at http://localhost:3010


## Running in Docker
> [Dockerfile](./Dockerfile)

### Dockerfile -> Image

```bash
docker build --tag spaceorbit-server:1.0 .
```

### Image -> Container

```bash
docker run -t -i -p 3010:3010 \
    --rm --name spaceorbit \
    --volume spaceorbitDB:/container/src/db/data \
    spaceorbit-server:1.0
```

- `-p` forwards container's ports
- `-ti` allows `CTRL + C` to stop container
- `--rm` removes container after exit
- `--name` becomes hostname for containers
- `--volume` makes database data persistent by [creating a named volume](https://github.com/moby/moby/issues/30647#issuecomment-276882545)


Server available at http://localhost:3010


### Server API

<details>
    <summary>Unfold to see the list of all API Routes of SpaceOrbit-server</summary>

    GET /users
    POST /users

    GET /users/:id
    PATCH /users/:id
    DELETE /users/:id

    POST /users/register

    POST /users/login

    POST /users/refreshToken

    POST /users/me

    POST /users/resetPassword

    GET /users/resetPassword/:id

    GET /endpoints
</details>

### Project structure
> Repository design pattern

- Server entry point at [/src/core/app.ts](./src/core/app.ts)
- Models are defined at [/src/db/schema.prisma](./src/db/schema.prisma)
- Database is stored at [/src/db/data](./src/db/data/)
- Controllers are defined at [/src/controllers/*](./src/controllers/users/User.ts)
- Middleware are defined at [/src/middleware/*](./src/middleware/isAuthenticated.ts)
- Routes are defined at [/src/routes/*](./src/routes/users/User.ts)
- Services are defined at [/src/services/*](./src/services/users/User.ts)
- Utility functions are defined at [/src/utils/*](./src/utils/jwt.ts)
