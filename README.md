# docgen

### To create and start the db

```
docker run --name docgen-postgres -e POSTGRES_PASSWORD=mysecretpassword -e POSTGRES_DB=postgres -p 5432:5432 -d postgres:15
```

Only need to do this part once I think. 
```
cd backend
python create_db.py
```