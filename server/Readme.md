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


## Server API

<details>
    <summary>Unfold to see the list of all API Routes of SpaceOrbit-server</summary>

    POST /users/register

    POST /users/login

    POST /users/refreshToken

    GET /users/me

    POST /users/resetPassword

    GET /users/resetPassword/:id

    GET /users
    POST /users

    GET /users/:id
    PATCH /users/:id
    DELETE /users/:id

    GET /endpoints
</details>


### JWT 

[src/controllers/users/User.ts](src/controllers/users/User.ts#L81)

[src/services/auth/Auth.ts](src/services/auth/Auth.ts)

[src/utils/jwt.ts](src/utils/jwt.ts)

#### Authentication
> - **Refresh Token** ― allows for acquirement of more **Access Tokens**
>   - Valid for **8 hours** 
>   - Requires check against db per use
>   - Revocation is immediate
> - **Access Token** ― provides access to protected routes
>   - Valid for **5 minutes**
>   - Does **not** require check against db per use
>   - Revocation is **not** immediate: users could still use **Access Token** for up to 5 minutes even with revoked **Refresh Token**


![](https://i.imgur.com/stVMxbO.png)

#### Using access token

![](https://i.imgur.com/bryP2ZC.png)


#### Refreshing both tokens

![](https://i.imgur.com/02YeBgh.png)


#### Logout

Logout is achieved by clearing tokens from local/session storage on the client


## Project structure
> Repository design pattern

- Server entry point at [/src/core/app.ts](./src/core/app.ts)
- Models are defined at [/src/db/schema.prisma](./src/db/schema.prisma)
- Database is stored at [/src/db/data](./src/db/data/)
- Controllers are defined at [/src/controllers/*](./src/controllers/users/User.ts)
- Middleware are defined at [/src/middleware/*](./src/middleware/isAuthenticated.ts)
- Routes are defined at [/src/routes/*](./src/routes/users/User.ts)
- Services are defined at [/src/services/*](./src/services/users/User.ts)
- Utility functions are defined at [/src/utils/*](./src/utils/jwt.ts)
