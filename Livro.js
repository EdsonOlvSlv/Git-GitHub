export class Livro {
  #isFamous = false;
  constructor(id, titulo, autorId, ano, genero, exemplares = 1) {
    this.id = id;
    this.titulo = titulo;
    this.autorId = autorId;
    this.ano = ano;
    this.genero = genero;
    this.exemplares = exemplares;
    this.disponiveis = exemplares;
  }

  get() {
    return this.#isFamous;
  }

  set(isFamous) {
    this.#isFamous = isFamous;
  }
}
