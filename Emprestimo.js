export class Emprestimo {
  constructor(id, usuarioId, livroId, dataEmprestimo, dataDevolucao = null) {
    this.id = id;
    this.usuarioId = usuarioId;
    this.livroId = livroId;
    this.dataEmprestimo = dataEmprestimo;
    this.dataDevolucao = dataDevolucao;
  }
}
