# Spaceorbit-server

## Running in Docker


### Main Microservice
> [Dockerfile](./Dockerfile)

#### Dockerfile -> Image

```bash
docker build --tag spaceorbit-server:1.0 .
```

#### Image -> Container

```bash
docker run -t -i -p 3010:3010 \
    --rm --name main \
    --volume dbMain:/container/src/db/data \
    spaceorbit-server:1.0
```

- `-p` forwards container's ports
- `-ti` allows `CTRL + C` to stop container
- `--rm` removes container after exit
- `--name` becomes hostname for containers
- `--volume` makes database data persistent by [creating a named volume](https://github.com/moby/moby/issues/30647#issuecomment-276882545)

- Server available at http://localhost:3010

## Running without Docker

```bash
sh run.sh install
```

```bash
sh run.sh migrate
```

```bash
sh run.sh
```

- Server available at http://localhost:3010


## Structure
> Repository design pattern


### Server API

<details>
    <summary>Unfold to see the list of all API Routes of Main Microservice</summary>

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

  

- Server entry point at [/src/core/app.ts](./src/core/app.ts)
- Models are defined at [/src/db/schema.prisma](./src/db/schema.prisma)
- Controllers are defined at [/src/controllers/*](./src/controllers/users/User.ts)
- Middlewares are defined at [/src/middleware/*](./src/middleware/isAuthenticated.ts)
- Routes are defined at [/src/routes/*](./src/routes/users/User.ts)
- Services are defined at [/src/services/*](./src/services/users/User.ts)
- Utility functions are defined at [/src/utils/*](./src/utils/jwt.ts)
