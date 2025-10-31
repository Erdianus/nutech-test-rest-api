-- users
CREATE TABLE users (
  	id BIGINT PRIMARY KEY AUTO_INCREMENT,
  	first_name VARCHAR(100) NOT NULL,
  	last_name VARCHAR(100) NOT NULL,
  	email VARCHAR(120) NOT NULL UNIQUE,
  	password VARCHAR(255) NOT NULL,
    profile_image VARCHAR(255),
  	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
) ENGINE=InnoDB;

-- wallets (1:1 dengan user)
CREATE TABLE wallets (
  	id BIGINT PRIMARY KEY AUTO_INCREMENT,
  	user_id BIGINT NOT NULL UNIQUE,
  	balance BIGINT NOT NULL DEFAULT 0, -- simpan dalam "sen" (integer) untuk hindari error floating
  	updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  	CONSTRAINT fk_wallet_user FOREIGN KEY (user_id) REFERENCES users(id)
) ENGINE=InnoDB;

CREATE TABLE services (
  	id BIGINT PRIMARY KEY AUTO_INCREMENT,
  	service_code VARCHAR(50) NOT NULL UNIQUE, -- contoh: PULSA_25, GAME_VCHR_100
    service_icon VARCHAR(225) NOT NULL,
  	name VARCHAR(120) NOT NULL,
  	cost BIGINT NOT NULL
) ENGINE=InnoDB;

CREATE TABLE banners (
  	id BIGINT PRIMARY KEY AUTO_INCREMENT,
  	name VARCHAR(120) NOT NULL,
  	image VARCHAR(225) NOT NULL,
  	description TEXT NOT NULL
) ENGINE=InnoDB;

-- transactions (riwayat topup & pembayaran)
CREATE TABLE transactions (
  	id BIGINT PRIMARY KEY AUTO_INCREMENT,
    invoice_code VARCHAR(50) NOT NULL UNIQUE,
  	user_id BIGINT NOT NULL,
    service_id BIGINT,         			-- null saat TOPUP
  	type ENUM('TOPUP','PAYMENT') NOT NULL,
  	amount BIGINT NOT NULL,           	-- jumlah uang (sen), topup = nilai topup, payment = harga produk
  	created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
  	CONSTRAINT fk_tx_user FOREIGN KEY (user_id) REFERENCES users(id),
  	CONSTRAINT fk_tx_service FOREIGN KEY (service_id) REFERENCES services(id)
) ENGINE=InnoDB;

INSERT INTO products(service_code,name,service_icon,cost) VALUES
('PAJAK','Pajak PBB',"https://nutech-integrasi.app/dummy.jpg",40000),
('PLN','Listrik',"https://nutech-integrasi.app/dummy.jpg",10000),
('PDAM','PDAM Berlangganan',"https://nutech-integrasi.app/dummy.jpg",40000),
('PGN','PGN Berlangganan',"https://nutech-integrasi.app/dummy.jpg",50000),
('MUSIK','Musik Berlangganan',"https://nutech-integrasi.app/dummy.jpg",50000),
('TV','TV Berlangganan',"https://nutech-integrasi.app/dummy.jpg",50000),
('PAKET_DATA','Paket Data',"https://nutech-integrasi.app/dummy.jpg",50000),
('VOUCHER_GAME','Voucher Game',"https://nutech-integrasi.app/dummy.jpg",100000),
('VOUCHER_MAKANAN','Voucher Makanan',"https://nutech-integrasi.app/dummy.jpg",100000),
('QURBAN','Qurban',"https://nutech-integrasi.app/dummy.jpg",200000),
('ZAKAT','Zakat',"https://nutech-integrasi.app/dummy.jpg",300000)


INSERT INTO banners(name,image,description) VALUES
('Banner 1',"https://nutech-integrasi.app/dummy.jpg","Lerem Ipsum Dolor sit amet"),
('Banner 2',"https://nutech-integrasi.app/dummy.jpg","Lerem Ipsum Dolor sit amet"),
('Banner 3',"https://nutech-integrasi.app/dummy.jpg","Lerem Ipsum Dolor sit amet"),
('Banner 4',"https://nutech-integrasi.app/dummy.jpg","Lerem Ipsum Dolor sit amet"),
('Banner 5',"https://nutech-integrasi.app/dummy.jpg","Lerem Ipsum Dolor sit amet")