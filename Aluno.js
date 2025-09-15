import { Usuario } from "./Usuario.js";

export class Aluno extends Usuario {
  constructor(id, nome, matricula) {
    super(id, nome, matricula, "Aluno");
  }

  getTipo() {
    return `Aluno - ${this.nome}`;
  }
}
