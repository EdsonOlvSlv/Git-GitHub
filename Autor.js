export class Autor {
  #isFamous = false;
  constructor(id, nome, nacionalidade, anoNascimento) {
    this.id = id;
    this.nome = nome;
    this.nacionalidade = nacionalidade;
    this.anoNascimento = anoNascimento;
  }

  get() {
    return this.#isFamous;
  }

  set(isFamous) {
    this.#isFamous = isFamous;
  }
}
