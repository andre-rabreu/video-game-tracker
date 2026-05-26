CREATE TABLE IF NOT EXISTS usuarios (
  id       VARCHAR(36)  PRIMARY KEY,
  username VARCHAR(50)  NOT NULL,
  email    VARCHAR(255) NOT NULL,
  password VARCHAR(255) NOT NULL,
  UNIQUE KEY uk_usuarios_email (email),
  UNIQUE KEY uk_usuarios_username (username)
);

CREATE TABLE IF NOT EXISTS jogos_usuario (
  id         VARCHAR(36) PRIMARY KEY,
  usuario_id VARCHAR(36) NOT NULL,
  jogo_id    VARCHAR(50) NOT NULL,
  titulo     VARCHAR(255) NOT NULL,
  capa_url   TEXT,
  status     ENUM('playing','to_play','completed') NOT NULL,
  CONSTRAINT fk_jogos_usuario_usuarios
    FOREIGN KEY (usuario_id) REFERENCES usuarios(id)
    ON DELETE CASCADE,
  INDEX idx_jogos_usuario_usuario (usuario_id)
);
