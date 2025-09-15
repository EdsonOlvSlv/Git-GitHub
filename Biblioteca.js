import { Autor } from "./Autor.js";
import { Emprestimo } from "./Emprestimo.js";
import { Livro } from "./Livro.js";
import { Usuario } from "./Usuario.js";
import { Aluno } from "./Aluno.js";
import { Professor } from "./Professor.js";

class Biblioteca {
  constructor() {
    this.autores = [];
    this.livros = [];
    this.usuarios = [];
    this.emprestimos = [];
    this.seqAutor = 1;
    this.seqLivro = 1;
    this.seqUsuario = 1;
    this.seqEmprestimo = 1;
  }

  // -------- Autores --------
  adicionarAutor(nome, nacionalidade, anoNascimento) {
    const autor = new Autor(
      this.seqAutor++,
      nome,
      nacionalidade,
      anoNascimento
    );
    this.autores.push(autor);
    return autor;
  }

  removerAutor(id) {
    this.autores = this.autores.filter((a) => a.id !== id);
  }

  updateAutor(id, dados) {
    const a = this.autores.find((x) => x.id == id);
    if (!a) return null;
    Object.assign(a, dados);
    return a;
  }

  // -------- Livros --------
  adicionarLivro(titulo, autorId, ano, genero, exemplares = 1) {
    const livro = new Livro(
      this.seqLivro++,
      titulo,
      autorId,
      ano,
      genero,
      exemplares
    );

    livro.exemplares = parseInt(exemplares, 10) || 1;
    livro.disponiveis = livro.disponiveis ?? livro.exemplares;
    this.livros.push(livro);
    return livro;
  }

  removerLivro(id) {
    this.livros = this.livros.filter((l) => l.id !== id);
  }

  updateLivro(id, dados) {
    const l = this.livros.find((x) => x.id == id);
    if (!l) return null;

    if (dados.exemplares !== undefined) {
      const newEx = parseInt(dados.exemplares, 10) || 0;
      const oldEx = parseInt(l.exemplares, 10) || 0;
      const diff = newEx - oldEx;
      l.exemplares = newEx;

      l.disponiveis = Math.max(
        0,
        Math.min(l.exemplares, (l.disponiveis ?? 0) + diff)
      );
    }

    const { exemplares, ...rest } = dados;
    Object.assign(l, rest);
    return l;
  }

  // -------- Usuários --------
  adicionarUsuario(nome, matricula, tipo) {
    let usuario;
    if (tipo === "Aluno") {
      usuario = new Aluno(this.seqUsuario++, nome, matricula);
    } else {
      usuario = new Professor(this.seqUsuario++, nome, matricula);
    }
    this.usuarios.push(usuario);
    return usuario;
  }

  removerUsuario(id) {
    this.usuarios = this.usuarios.filter((u) => u.id !== id);
  }

  updateUsuario(id, dados) {
    const idx = this.usuarios.findIndex((x) => x.id == id);
    if (idx === -1) return null;
    const u = this.usuarios[idx];

    if (dados.tipo && dados.tipo !== u.tipo) {
      const nome = dados.nome ?? u.nome;
      const matricula = dados.matricula ?? u.matricula;
      const nova =
        dados.tipo === "Aluno"
          ? new Aluno(u.id, nome, matricula)
          : new Professor(u.id, nome, matricula);

      Object.assign(nova, { ...u, ...dados });
      nova.id = u.id;
      this.usuarios[idx] = nova;
      return nova;
    }

    Object.assign(u, dados);
    return u;
  }

  // -------- Empréstimos --------
  emprestarLivro(usuarioId, livroId) {
    const livro = this.livros.find((l) => l.id == livroId);
    if (!livro || (livro.disponiveis ?? 0) <= 0) return null;

    livro.disponiveis--;
    const emprestimo = new Emprestimo(
      this.seqEmprestimo++,
      usuarioId,
      livroId,
      new Date().toLocaleDateString()
    );
    this.emprestimos.push(emprestimo);
    return emprestimo;
  }

  devolverLivro(emprestimoId) {
    const emp = this.emprestimos.find((e) => e.id == emprestimoId);
    if (emp && !emp.dataDevolucao) {
      emp.dataDevolucao = new Date().toLocaleDateString();
      const livro = this.livros.find((l) => l.id === emp.livroId);
      if (livro) livro.disponiveis = (livro.disponiveis ?? 0) + 1;
    }
  }
}

// Instância global
const biblioteca = new Biblioteca();

// ------------------ UI / DOM ------------------
document.addEventListener("DOMContentLoaded", () => {
  function clearForm(form) {
    try {
      form.reset();
    } catch (e) {}
    const idInput = form.querySelector('input[name="id"]');
    if (idInput) idInput.value = "";
  }

  // Tabs
  document.querySelectorAll("nav button").forEach((btn) => {
    btn.addEventListener("click", () => {
      document
        .querySelectorAll(".tab")
        .forEach((t) => t.classList.remove("ativo"));
      document.getElementById(btn.dataset.tab).classList.add("ativo");
    });
  });

  // ---------- FORM AUTORES ----------
  const formAutor = document.getElementById("formAutor");
  formAutor.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = (formAutor.id.value || "").toString().trim();
    if (id) {
      biblioteca.updateAutor(parseInt(id, 10), {
        nome: formAutor.nome.value,
        nacionalidade: formAutor.nacionalidade.value,
        anoNascimento: formAutor.anoNascimento.value,
      });
    } else {
      biblioteca.adicionarAutor(
        formAutor.nome.value,
        formAutor.nacionalidade.value,
        formAutor.anoNascimento.value
      );
    }
    clearForm(formAutor);
    renderAutores();
    renderAutoresSelect();
  });

  function renderAutores() {
    const tbody = document.getElementById("listaAutores");
    tbody.innerHTML = "";
    biblioteca.autores.forEach((a) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${a.id}</td>
        <td>${a.nome}</td>
        <td>
          <button onclick="editarAutor(${a.id})">Editar</button>
          <button onclick="removerAutor(${a.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.editarAutor = (id) => {
    const a = biblioteca.autores.find((x) => x.id == id);
    if (!a) return;
    formAutor.id.value = a.id;
    formAutor.nome.value = a.nome;
    formAutor.nacionalidade.value = a.nacionalidade;
    formAutor.anoNascimento.value = a.anoNascimento;
  };

  window.removerAutor = (id) => {
    biblioteca.removerAutor(id);
    renderAutores();
    renderAutoresSelect();
  };

  function renderAutoresSelect() {
    const sel = document.querySelector("#formLivro select[name=autorId]");
    if (!sel) return;
    sel.innerHTML = "<option value=''>Selecione o autor</option>";
    biblioteca.autores.forEach((a) => {
      sel.innerHTML += `<option value="${a.id}">${a.nome}</option>`;
    });
  }

  // ---------- FORM LIVROS ----------
  const formLivro = document.getElementById("formLivro");
  formLivro.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = (formLivro.id.value || "").toString().trim();
    const exemplaresVal = parseInt(formLivro.exemplares.value, 10) || 1;
    if (id) {
      biblioteca.updateLivro(parseInt(id, 10), {
        titulo: formLivro.titulo.value,
        autorId: parseInt(formLivro.autorId.value, 10),
        ano: formLivro.ano.value,
        genero: formLivro.genero.value,
        exemplares: exemplaresVal,
      });
    } else {
      biblioteca.adicionarLivro(
        formLivro.titulo.value,
        parseInt(formLivro.autorId.value, 10),
        formLivro.ano.value,
        formLivro.genero.value,
        exemplaresVal
      );
    }
    clearForm(formLivro);
    renderLivros();
    renderLivrosSelect();
  });

  function renderLivros() {
    const tbody = document.getElementById("listaLivros");
    tbody.innerHTML = "";
    biblioteca.livros.forEach((l) => {
      const autor =
        biblioteca.autores.find((a) => a.id === l.autorId)?.nome || "—";

      const dispon = l.disponiveis ?? 0;
      const exempl = l.exemplares ?? 0;
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${l.id}</td>
        <td>${l.titulo}</td>
        <td>${autor}</td>
        <td>${dispon}/${exempl}</td>
        <td>
          <button onclick="editarLivro(${l.id})">Editar</button>
          <button onclick="removerLivro(${l.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.editarLivro = (id) => {
    const l = biblioteca.livros.find((x) => x.id == id);
    if (!l) return;
    formLivro.id.value = l.id;
    formLivro.titulo.value = l.titulo;
    formLivro.autorId.value = l.autorId;
    formLivro.ano.value = l.ano;
    formLivro.genero.value = l.genero;
    formLivro.exemplares.value = l.exemplares;
  };

  window.removerLivro = (id) => {
    biblioteca.removerLivro(id);
    renderLivros();
    renderLivrosSelect();
  };

  function renderLivrosSelect() {
    const sel = document.querySelector("#formEmprestimo select[name=livroId]");
    if (!sel) return;
    sel.innerHTML = "<option value=''>Selecione o livro</option>";
    biblioteca.livros.forEach((l) => {
      if ((l.disponiveis ?? 0) > 0) {
        sel.innerHTML += `<option value="${l.id}">${l.titulo}</option>`;
      }
    });
  }

  // ---------- FORM USUÁRIOS ----------
  const formUsuario = document.getElementById("formUsuario");
  formUsuario.addEventListener("submit", (e) => {
    e.preventDefault();
    const id = (formUsuario.id.value || "").toString().trim();
    if (id) {
      biblioteca.updateUsuario(parseInt(id, 10), {
        nome: formUsuario.nome.value,
        matricula: formUsuario.matricula.value,
        tipo: formUsuario.tipo.value,
      });
    } else {
      biblioteca.adicionarUsuario(
        formUsuario.nome.value,
        formUsuario.matricula.value,
        formUsuario.tipo.value
      );
    }
    clearForm(formUsuario);
    renderUsuarios();
    renderUsuariosSelect();
  });

  function renderUsuarios() {
    const tbody = document.getElementById("listaUsuarios");
    tbody.innerHTML = "";
    biblioteca.usuarios.forEach((u) => {
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${u.id}</td>
        <td>${u.nome}</td>
        <td>${u.tipo}</td>
        <td>
          <button onclick="editarUsuario(${u.id})">Editar</button>
          <button onclick="removerUsuario(${u.id})">Excluir</button>
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.editarUsuario = (id) => {
    const u = biblioteca.usuarios.find((x) => x.id == id);
    if (!u) return;
    formUsuario.id.value = u.id;
    formUsuario.nome.value = u.nome;
    formUsuario.matricula.value = u.matricula;
    formUsuario.tipo.value = u.tipo;
  };

  window.removerUsuario = (id) => {
    biblioteca.removerUsuario(id);
    renderUsuarios();
    renderUsuariosSelect();
  };

  function renderUsuariosSelect() {
    const sel = document.querySelector(
      "#formEmprestimo select[name=usuarioId]"
    );
    if (!sel) return;
    sel.innerHTML = "<option value=''>Selecione o usuário</option>";
    biblioteca.usuarios.forEach((u) => {
      sel.innerHTML += `<option value="${u.id}">${u.nome}</option>`;
    });
  }

  // ---------- FORM EMPRÉSTIMOS ----------
  const formEmprestimo = document.getElementById("formEmprestimo");
  formEmprestimo.addEventListener("submit", (e) => {
    e.preventDefault();
    biblioteca.emprestarLivro(
      parseInt(formEmprestimo.usuarioId.value, 10),
      parseInt(formEmprestimo.livroId.value, 10)
    );
    renderEmprestimos();
    renderLivros();
    renderLivrosSelect();
  });

  function renderEmprestimos() {
    const tbody = document.getElementById("listaEmprestimos");
    tbody.innerHTML = "";
    biblioteca.emprestimos.forEach((emp) => {
      const usuario =
        biblioteca.usuarios.find((u) => u.id === emp.usuarioId)?.nome || "—";
      const livro =
        biblioteca.livros.find((l) => l.id === emp.livroId)?.titulo || "—";
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${emp.id}</td>
        <td>${usuario}</td>
        <td>${livro}</td>
        <td>${emp.dataEmprestimo}</td>
        <td>${emp.dataDevolucao || "—"}</td>
        <td>
          ${
            emp.dataDevolucao
              ? ""
              : `<button onclick="devolver(${emp.id})">Devolver</button>`
          }
        </td>
      `;
      tbody.appendChild(tr);
    });
  }

  window.devolver = (id) => {
    biblioteca.devolverLivro(id);
    renderEmprestimos();
    renderLivros();
    renderLivrosSelect();
  };

  // ---------- RELATÓRIOS ----------
  function gerarRelatorios() {
    const usuarios = biblioteca.usuarios;
    const emprestimos = biblioteca.emprestimos;
    const livros = biblioteca.livros;

    // --- Usuários mais ativos ---
    const rankingUsuarios = {};
    emprestimos.forEach((e) => {
      rankingUsuarios[e.usuarioId] = (rankingUsuarios[e.usuarioId] || 0) + 1;
    });

    const usuariosAtivos = Object.entries(rankingUsuarios)
      .map(([usuarioId, qtd]) => {
        const u = usuarios.find((u) => u.id == usuarioId);
        return { nome: u?.nome, tipo: u?.tipo, qtd };
      })
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    let htmlUsuarios = `<h3>Top Usuários Ativos</h3><ul>`;
    if (usuariosAtivos.length === 0) {
      htmlUsuarios += "<li>Nenhum empréstimo registrado ainda.</li>";
    } else {
      usuariosAtivos.forEach((u) => {
        htmlUsuarios += `<li>${u.nome} (${u.tipo}) → ${u.qtd} empréstimos</li>`;
      });
    }
    htmlUsuarios += "</ul>";
    document.getElementById("relUsuariosAtivos").innerHTML = htmlUsuarios;

    // --- Livros mais emprestados ---
    const rankingLivros = {};
    emprestimos.forEach((e) => {
      rankingLivros[e.livroId] = (rankingLivros[e.livroId] || 0) + 1;
    });

    const livrosMais = Object.entries(rankingLivros)
      .map(([livroId, qtd]) => {
        const l = livros.find((l) => l.id == livroId);
        return { titulo: l?.titulo, qtd };
      })
      .sort((a, b) => b.qtd - a.qtd)
      .slice(0, 5);

    let htmlLivros = `<h3>Livros Mais Emprestados</h3><ol>`;
    if (livrosMais.length === 0) {
      htmlLivros += "<li>Nenhum empréstimo registrado ainda.</li>";
    } else {
      livrosMais.forEach((l) => {
        htmlLivros += `<li>${l.titulo} → ${l.qtd} vezes</li>`;
      });
    }
    htmlLivros += "</ol>";
    document.getElementById("relMaisEmprestados").innerHTML = htmlLivros;
  }

  document
    .querySelector("button[data-tab='relatorios']")
    .addEventListener("click", gerarRelatorios);

  function renderRelatorios() {
    // Mais emprestados
    const livrosContagem = {};
    db.Emprestimos.forEach((e) => {
      livrosContagem[e.LivroId] = (livrosContagem[e.LivroId] || 0) + 1;
    });

    let rankingLivros = Object.entries(livrosContagem)
      .map(([id, qtd]) => ({ Titulo: getTituloLivro(id), Qtd: qtd }))
      .sort((a, b) => b.Qtd - a.Qtd);

    document.querySelector("#relMaisEmprestados").innerHTML = `
    <h3>📚 Livros mais emprestados</h3>
    <ul>
      ${
        rankingLivros.map((l) => `<li>${l.Titulo} — ${l.Qtd}x</li>`).join("") ||
        "<li>Nenhum empréstimo</li>"
      }
    </ul>
  `;

    // Usuários mais ativos
    const usuariosContagem = {};
    db.Emprestimos.forEach((e) => {
      usuariosContagem[e.UsuarioId] = (usuariosContagem[e.UsuarioId] || 0) + 1;
    });

    let rankingUsuarios = Object.entries(usuariosContagem)
      .map(([id, qtd]) => ({ Nome: getNomeUsuario(id), Qtd: qtd }))
      .sort((a, b) => b.Qtd - a.Qtd);

    document.querySelector("#relUsuariosAtivos").innerHTML = `
    <h3>👤 Usuários mais ativos</h3>
    <ul>
      ${
        rankingUsuarios
          .map((u) => `<li>${u.Nome} — ${u.Qtd} empréstimos</li>`)
          .join("") || "<li>Nenhum empréstimo</li>"
      }
    </ul>
  `;
  }

  renderAutores();
  renderAutoresSelect();
  renderLivros();
  renderLivrosSelect();
  renderUsuarios();
  renderUsuariosSelect();
  renderEmprestimos();
});
