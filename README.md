# Backend Test Case

## Entities

- Member
- Book

## Use Case

- Members can borrow books with conditions
    - [ ]  Members may not borrow more than 2 books
    - [ ]  Borrowed books are not borrowed by other members
    - [ ]  Member is currently not being penalized
- Member returns the book with conditions
    - [ ]  The returned book is a book that the member has borrowed
    - [ ]  If the book is returned after more than 7 days, the member will be subject to a penalty. Member with penalty cannot able to borrow the book for 3 days
- Check the book
    - [x ]  Shows all existing books and quantities
    - [ ]  Books that are being borrowed are not counted
- Member check
    - [ ]  Shows all existing members
    - [ ]  The number of books being borrowed by each member

## Requirements

- [ ]  it should be use any framework, but prefered [NestJS](https://nestjs.com/) Framework Or [ExpressJS](https://expressjs.com/)
- [ ]  it should be use Swagger as API Documentation
- [ ]  it should be use Database (SQL/NoSQL)
- [ ]  it should be open sourced on your github repo

## Extras

- [ ]  Implement [DDD Pattern]([https://khalilstemmler.com/articles/categories/domain-driven-design/](https://khalilstemmler.com/articles/categories/domain-driven-design/))
- [ ]  Implement Unit Testing

## Notes
- Feel free to add some structure or plugins


------
