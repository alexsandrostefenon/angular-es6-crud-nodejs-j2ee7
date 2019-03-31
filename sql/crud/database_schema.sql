CREATE TABLE crud_service (
    name character varying(512) PRIMARY KEY,
    menu character varying(255),
    template character varying(512), -- html
    save_and_exit boolean,
    is_on_line boolean,
    title character varying(255),
    fields character varying(10240)
);

CREATE TABLE crud_group_owner (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name character varying(255) NOT NULL UNIQUE
);

CREATE TABLE crud_user (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    crud_group_owner integer references crud_group_owner NOT NULL,
    name character varying(32) UNIQUE NOT NULL,
    password character varying(255) NOT NULL,
    roles character varying(10240),
    routes character varying(10240),
    path character varying(255),
    menu character varying(10240),
    show_system_menu boolean default false,
    authctoken character varying(255)
);

CREATE TABLE crud_group (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    name character varying(32) NOT NULL UNIQUE
);

CREATE TABLE crud_group_user (
    crud_user integer references crud_user NOT NULL,
    crud_group integer references crud_group NOT NULL,
    PRIMARY KEY(crud_user,crud_group)
);

CREATE TABLE crud_translation (
    id integer GENERATED BY DEFAULT AS IDENTITY PRIMARY KEY,
    locale character varying(255) NOT NULL default 'pt-br',
    name character varying(255) NOT NULL,
    translation character varying(255)
);

create sequence hibernate_sequence;