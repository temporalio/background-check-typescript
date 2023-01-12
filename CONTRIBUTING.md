### Update External API

To update `external-api.ts`, first run [this server](https://github.com/mbernier/python-background-check-api) and then run:

```
npm run update-external-api
```

### Test

```
curl --header "Content-Type: application/json" \
  --request POST \
  --data '{"customerId":"customer-1","userId":"user-1","action":"start"}' \
  http://localhost:3000/background
```