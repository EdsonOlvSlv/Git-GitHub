import { Usuario } from "./Usuario.js";

export class Professor extends Usuario {
  constructor(id, nome, matricula) {
    super(id, nome, matricula, "Professor");
  }

  getTipo() {
    return `Professor - ${this.nome}`;
  }
}
