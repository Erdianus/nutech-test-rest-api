import { query } from "../utils/sql.js";

async function getBanners() {
  const banners = await query("SELECT * FROM banners");
  return {
    status: 0,
    message: "Sukses",
    data: banners.map((banner) => ({
      banner_id: banner.id,
      banner_name: banner.name,
      banner_image: banner.image,
      description: banner.description,
    })),
  };
}

async function getServices() {
  const services = await query("SELECT * FROM services");
  return {
    status: 0,
    message: "Sukses",
    data: services.map((service) => ({
      service_code: service.service_code,
      service_name: service.name,
      service_icon: service.service_icon,
      service_tarif: service.cost,
    })),
  };
}

export { getBanners, getServices };
