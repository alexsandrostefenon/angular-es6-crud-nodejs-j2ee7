CREATE TABLE payment_type (
	id integer PRIMARY KEY,
	description character varying(255),
	name character varying(50) NOT NULL
);

CREATE TABLE bacen_country (
	id integer PRIMARY KEY default 1058,
	name varchar(100) unique not null default 'Brazil',
	name_pt varchar(100) unique not null default 'Brasil',
	abr varchar(2) unique not null default 'BR'
);

CREATE TABLE ibge_uf (
	id integer PRIMARY KEY,
	country integer references bacen_country default 1058,
	name varchar(100) unique not null,
	abr varchar(2) unique not null default 'RS',
	ddd varchar(50) DEFAULT NULL
);

CREATE TABLE ibge_city (
	id integer PRIMARY KEY,
	uf integer references ibge_uf default 43,
	name varchar(100) null,
	UNIQUE(name,uf)
);

CREATE TABLE ibge_cnae (
	id integer PRIMARY KEY,
	name varchar(512) unique not null
);

CREATE TABLE camex_ncm (
	id integer PRIMARY KEY,
	name varchar(1024) not null,
	unit varchar(16),
	tec integer -- taxa percentual de IPI
);

CREATE TABLE confaz_cest (
	id integer,
	ncm integer,-- references camex_ncm,
	name varchar(1024),
	primary key(id, ncm)
);

CREATE TABLE nfe_cfop (
	id integer PRIMARY KEY,
	name varchar(1024) not null,
	ind_nfe integer default 1,
	ind_comunica integer default 0,
	ind_transp integer default 0,
	ind_devol integer default 0
);

CREATE TABLE nfe_st_cofins (
	id integer primary key,
	name varchar(1024)
);

CREATE TABLE nfe_st_csosn (
	id integer primary key,
	name varchar(1024),
	description varchar(1024)
);

CREATE TABLE nfe_st_icms_desoneracao (
	id integer primary key,
	name varchar(1024)
);

CREATE TABLE nfe_st_icms_modalidade_bc (
	id integer primary key,
	name varchar(1024)
);

CREATE TABLE nfe_st_icms_modalidade_st (
	id integer primary key,
	name varchar(1024)
);

CREATE TABLE nfe_st_icms_origem (
	id integer primary key,
	name varchar(255)
);

CREATE TABLE nfe_st_icms (
	id integer primary key,
	name varchar(255)
);

CREATE TABLE nfe_st_ipi_operacao (
	id integer primary key,
	name varchar(255)
);

CREATE TABLE nfe_st_ipi_enquadramento (
	id integer primary key,
	name varchar(1024),
	ipi_operacao integer references nfe_st_ipi_operacao
);

CREATE TABLE nfe_st_ipi (
	id integer primary key,
	name varchar(255)
);

CREATE TABLE nfe_st_pis (
	id integer primary key,
	name varchar(255)
);

CREATE TABLE nfe_tax_group (
	id SERIAL PRIMARY KEY,
	name character varying(100) UNIQUE,
	cst_ipi integer references nfe_st_ipi,
	cst_icms integer references nfe_st_icms,-- 00=Tributada integralmente; 10=Tributada e com cobrança do ICMS por ST; 20=Com redução de base de cálculo; 30=Isenta ou não tributada e com cobrança do ICMS por ST; 40=Isenta; 41=Não tributada;  50=Suspensão; 51=Diferimento; 60=ICMS cobrado anteriormente por ST; 70=Com redução de base de cálculo e cobrança do ICMS por ST; 90=Outros  
	cst_pis integer references nfe_st_pis,
	cst_cofins integer references nfe_st_cofins,
	tax_simples numeric(5,2) DEFAULT 0.00,
	tax_ipi numeric(5,2) DEFAULT 0.00,
	tax_icms numeric(5,2) DEFAULT 0.00,
	tax_pis numeric(5,2) DEFAULT 0.00,
	tax_cofins numeric(5,2) DEFAULT 0.00,
	tax_issqn numeric(5,2) DEFAULT 0.00
);