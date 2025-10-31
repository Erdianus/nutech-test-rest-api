import * as informationService from "../services/information_service.js";

async function getServices(req, res, next) {
  try {
    const services = await informationService.getServices();
    res.json(services);
  } catch (err) {
    next(err);
  }
}

async function getBanners(req, res, next) {
  try {
    const banners = await informationService.getBanners();
    res.json(banners);
  } catch (err) {
    next(err);
  }
}

export { getServices, getBanners };
