const notFoundMiddleWare = (req, res) =>
  res.status(404).send("This Route does not exist");


  module.exports = notFoundMiddleWare