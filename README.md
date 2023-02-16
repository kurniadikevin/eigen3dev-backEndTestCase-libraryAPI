# Backend Test Case Eigen3dev

## Entities

- Member
- Book

## Note
This project run locally on ```http://localhost:3000```
To run project locally use command ```npm run dev``` for run it with auto update using nodemon.


## Swagger-API-Docs
Swagger API Dos available at ```http://localhost:3000/api-docs/```

## Database

-MongoDb

## Use Case

- Get all member list (GET)

  ```http://localhost:3000/members```
 

- Get all book that available in stock  (GET)  
 ```http://localhost:3000/books```

- Borrow book (POST)

  ```http://localhost:3000/borrow-book```

- Return book (POST)

  ```http://localhost:3000/return-book```


- Update penalized member (POST)

  ```http://localhost:3000/update-penalized```

