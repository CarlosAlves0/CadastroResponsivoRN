/**
 * CadastroResponsivo: SOMENTE A LÓGICA (backend do formulário)
 * Tudo em um único arquivo. O front end (JSX e estilos) fica na seção 6.
 *
 * Como o responsável pelo front end deve usar:
 *
 *   const { telaLarga, larguraFormulario } = useLayoutResponsivo();
 *   const { valores, erros, alterarCampo, salvar, limpar } = useCadastroForm({
 *     onSalvar: (dados) => { ... },
 *   });
 *
 *   - Valor do campo ....... value={valores.nome}
 *   - Ao digitar ........... onChangeText={(t) => alterarCampo('nome', t)}
 *   - Mensagem de erro ..... erros.nome (string, ou undefined se não houver erro)
 *   - Borda do inválido .... trocar a cor da borda quando erros.nome existir
 *   - Botão Salvar ......... onPress={salvar}
 *   - Botão Limpar ......... onPress={limpar}
 *   - Nome e E-mail ........ flexDirection: telaLarga ? 'row' : 'column'
 *   - Largura máxima ....... width: larguraFormulario (dentro de um ScrollView)
 */
import React, { useCallback, useState } from 'react';
import { Text, useWindowDimensions, View } from 'react-native';

/* ================================================================== */
/* 1) TIPOS                                                            */
/* ================================================================== */

// Nomes dos campos do formulário
export type Campo = 'nome' | 'email' | 'curso' | 'senha';

// Valores digitados pelo usuário
export type FormValores = Record<Campo, string>;

// Mensagens de erro por campo (campo sem erro = chave ausente)
export type FormErros = Partial<Record<Campo, string>>;

/* ================================================================== */
/* 2) CONSTANTES                                                       */
/* ================================================================== */

// Estado inicial: formulário vazio
export const VALORES_INICIAIS: FormValores = { nome: '', email: '', curso: '', senha: '' };

// Tamanho mínimo da senha exigido pela atividade
export const SENHA_MINIMA = 8;

// Validação simples de formato: texto@texto.texto, sem espaços
const REGEX_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

// A partir desta largura (dp), Nome e E-mail ficam lado a lado
export const LARGURA_TELA_LARGA = 600;

// Largura máxima do formulário (dp), para não esticar demais em telas grandes
export const LARGURA_MAXIMA_FORMULARIO = 560;

/* ================================================================== */
/* 3) VALIDAÇÃO                                                        */
/* ================================================================== */

/**
 * Valida um único campo.
 * @returns mensagem de erro, ou undefined se o valor for válido.
 */
export function validarCampo(campo: Campo, valor: string): string | undefined {
  switch (campo) {
    case 'nome':
      if (valor.trim().length === 0) return 'Informe seu nome.';
      return undefined;

    case 'curso':
      if (valor.trim().length === 0) return 'Informe seu curso.';
      return undefined;

    case 'email':
      if (valor.trim().length !== 0 && !REGEX_EMAIL.test(valor.trim())) {
        return 'E-mail inválido. Use o formato nome@exemplo.com.';
      }
      return undefined;

    case 'senha':
      // Senha não recebe trim: espaços fazem parte dela
      if (valor.length !== 0 && valor.length < SENHA_MINIMA) {
        return `A senha deve ter no mínimo ${SENHA_MINIMA} caracteres.`;
      }
      return undefined;
  }
}

/**
 * Valida todos os campos de uma vez.
 * @returns objeto só com os campos inválidos ({} = formulário válido).
 */
export function validarFormulario(valores: FormValores): FormErros {
  const erros: FormErros = {};
  (Object.keys(valores) as Campo[]).forEach((campo) => {
    const mensagem = validarCampo(campo, valores[campo]);
    if (mensagem) erros[campo] = mensagem;
  });
  return erros;
}

/* ================================================================== */
/* 4) HOOK DO FORMULÁRIO (estado + ações)                              */
/* ================================================================== */

type OpcoesForm = {
  /**
   * Chamada somente quando o formulário é válido ao tocar em Salvar.
   * Recebe os dados já limpos (nome, e-mail e curso sem espaços nas pontas).
   */
  onSalvar?: (dados: FormValores) => void;
};

export function useCadastroForm(opcoes: OpcoesForm = {}) {
  const [valores, setValores] = useState<FormValores>(VALORES_INICIAIS);
  const [erros, setErros] = useState<FormErros>({});

  /**
   * Atualiza o valor de um campo (use no onChangeText).
   * Também remove o erro desse campo assim que o usuário começa a corrigir.
   */
  const alterarCampo = useCallback((campo: Campo, valor: string) => {
    setValores((anterior) => ({ ...anterior, [campo]: valor }));
    setErros((anterior) => {
      if (!anterior[campo]) return anterior; // nada a remover
      const { [campo]: _removido, ...restante } = anterior;
      return restante;
    });
  }, []);

  /**
   * Botão Salvar: valida tudo e, se estiver correto, chama onSalvar.
   * @returns true se o formulário é válido, false caso contrário.
   */
  const salvar = useCallback((): boolean => {
    const novosErros = validarFormulario(valores);
    setErros(novosErros);

    if (Object.keys(novosErros).length > 0) return false; // há erros: não salva

    opcoes.onSalvar?.({
      nome: valores.nome.trim(),
      email: valores.email.trim(),
      curso: valores.curso.trim(),
      senha: valores.senha,
    });
    return true;
  }, [valores, opcoes]);

  /** Botão Limpar: zera os campos e remove todos os erros. */
  const limpar = useCallback(() => {
    setValores(VALORES_INICIAIS);
    setErros({});
  }, []);

  return { valores, erros, alterarCampo, salvar, limpar };
}

/* ================================================================== */
/* 5) HOOK DE LAYOUT RESPONSIVO                                        */
/* ================================================================== */

/**
 * Decide o layout conforme a largura atual da tela.
 * useWindowDimensions recalcula sozinho quando o celular gira.
 */
export function useLayoutResponsivo() {
  const { width } = useWindowDimensions();

  return {
    telaLarga: width >= LARGURA_TELA_LARGA, // true: Nome e E-mail lado a lado
    larguraFormulario: Math.min(width, LARGURA_MAXIMA_FORMULARIO),
  };
}

/* ================================================================== */
/* 6) FRONT END: A SER FEITO PELO RESPONSÁVEL PELA INTERFACE           */
/* ================================================================== */

// export default function App() {
//   // Exemplo de ligação com a lógica (descomente e use no JSX):
//   // const { telaLarga, larguraFormulario } = useLayoutResponsivo();
//   // const { valores, erros, alterarCampo, salvar, limpar } = useCadastroForm({
//   //   onSalvar: (dados) => Alert.alert('Cadastro salvo', `Bem-vindo(a), ${dados.nome}!`),
//   // });

//   // Placeholder temporário, só para o projeto compilar. Substituir pela interface.
//   return (
//     <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
//       <Text>Front end pendente</Text>
//     </View>
//   );
// }
