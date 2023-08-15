import { Router } from 'express'

export default Router().get('/', (req, res) => {
  console.log(req.query)
  res.send('API working')
})