# AI agents & Eigen

```bash
# build locally to test
docker buildx build --platform linux/amd64 -t yazhul1cache/mooncl:latest .
docker run --rm -p 23587:23587 yazhul1cache/mooncl:latest
```

Now, prepare your `.env` file, including the `MNEMONIC` and necessary API key for eigen cloud & eigen AI:

```bash
OPENAI_API_KEY="your-api-key"
BASE_URL="your-api-base-url"
FAST_MODEL="your-model"
MNEMONIC="your phrases"
```

then deploy to eigen-compute:

```bash
# login & auth
eigenx auth login             # or first eigenx auth generate --store
docker login

# deploy
eigenx app deploy
```