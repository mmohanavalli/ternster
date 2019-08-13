var Sequelize = require("sequelize");
const Op = Sequelize.Op;
const Cities = require("../models").Cities;

module.exports = {
  async getCitiesList(req, res, next) {
    try {
      const uppercaseFirstLetter = req.params.city.charAt(0).toUpperCase()+ req.params.city.slice(1);
      const citiesList = await Cities.findAll({
        where: {
          [Op.or]: [
            {
              full_name_nd: { [Op.like]: `${uppercaseFirstLetter}%` }
            },
            {
             country_name: { [Op.like]: `${uppercaseFirstLetter}%` }
            }
          ]
        },
        limit: 50,
        order: [["full_name_nd", "ASC"],["country_name", "ASC"]]
      });
      res.status(200).json({
        status: 200,
        message: "cities list successfully fetched.",
        response: citiesList
      });
    } catch (error) {
      res.status(500).json({
        status: 500,
        message: "Internal Server",
        response: error
      });
    }
  },
};
