export type GuestType = 'adult' | 'child' | 'baby';

export interface Guest {
  id: string;
  name: string;
  type: GuestType;
  meal?: string;
  dietary?: string;
  isMain: boolean;
  mainGuestId?: string;
}

const DUCK = 'Folhado de pato';
const VEG = 'Folhado de legumes';
const BURGER = 'Hambúrguer';

export const INITIAL_GUESTS: Guest[] = [
  // --- Grupo 1: Sandra Castela (sozinha)
  { id: 'g1', name: 'Sandra Castela', type: 'adult', meal: VEG, dietary: 'Vegetariana', isMain: true },

  // --- Grupo 2: Nuno Fernandes (sozinho)
  { id: 'g2', name: 'Nuno Fernandes', type: 'adult', meal: DUCK, isMain: true },

  // --- Grupo 3: Maria José Mateus + José Corado
  { id: 'g3', name: 'Maria José Mateus', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g4', name: 'José Corado', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g3' },

  // --- Grupo 4: Gonçalo Querido + Flávia Drave
  { id: 'g5', name: 'Gonçalo Querido', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g6', name: 'Flávia Drave', type: 'adult', meal: DUCK, dietary: 'Sem porco', isMain: false, mainGuestId: 'g5' },

  // --- Grupo 5: Francisco Sande e Castro + Margarida Pavão
  { id: 'g7', name: 'Francisco Sande e Castro', type: 'adult', meal: DUCK, dietary: 'Sem marisco', isMain: true },
  { id: 'g8', name: 'Margarida Pavão', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g7' },

  // --- Grupo 6: Rita Gonçalves + Pedro Esteves
  { id: 'g9', name: 'Rita Gonçalves', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g10', name: 'Pedro Esteves', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g9' },

  // --- Grupo 7: Margarida Espiga + Filipe Serra
  { id: 'g11', name: 'Margarida Espiga', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g12', name: 'Filipe Serra', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g11' },

  // --- Grupo 8: Sille Martma + Bruno Sousa
  { id: 'g13', name: 'Sille Martma', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g14', name: 'Bruno Sousa', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g13' },

  // --- Grupo 9: Corina Mata + Bernardo Lima
  { id: 'g15', name: 'Corina Mata', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g16', name: 'Bernardo Lima', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g15' },

  // --- Grupo 10: Joana Mayer + Francisco Piano
  { id: 'g17', name: 'Joana Mayer', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g18', name: 'Francisco Piano', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g17' },

  // --- Grupo 11: Susana Claudino + Hugo Raminhos
  { id: 'g19', name: 'Susana Claudino', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g20', name: 'Hugo Raminhos', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g19' },

  // --- Grupo 12: Diana Secrieru + Liana Secrieru (criança)
  { id: 'g21', name: 'Diana Secrieru', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g22', name: 'Liana Secrieru', type: 'child', meal: BURGER, isMain: false, mainGuestId: 'g21' },

  // --- Grupo 13: Patrício Gonçalves + acompanhante
  { id: 'g23', name: 'Patrício Gonçalves', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g24', name: 'Acompanhante Patrício', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g23' },

  // --- Grupo 14: João Pinto (bebé)
  { id: 'g25', name: 'João Pinto', type: 'baby', isMain: true },

  // --- Grupo 15: Nicolau Pinto + Paula Caldeira
  { id: 'g26', name: 'Nicolau Pinto', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g27', name: 'Paula Caldeira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g26' },

  // --- Grupo 16: Teresa Saldanha de Azevedo (sozinha)
  { id: 'g28', name: 'Teresa Saldanha de Azevedo', type: 'adult', meal: DUCK, isMain: true },

  // --- Grupo 17: Família Heitor
  { id: 'g29', name: 'Luís Heitor', type: 'adult', isMain: true },
  { id: 'g30', name: 'Margarida Heitor', type: 'adult', isMain: false, mainGuestId: 'g29' },
  { id: 'g31', name: 'Duarte Heitor', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g29' },

  // --- Grupo 18: Rui Ribeiro da Silva (sozinho)
  { id: 'g32', name: 'Rui Ribeiro da Silva', type: 'adult', meal: DUCK, isMain: true },

  // --- Grupo 19: Fernando Sanchez + Rita Baptista
  { id: 'g33', name: 'Fernando Sanchez', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g34', name: 'Rita Baptista', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g33' },

  // --- Grupo 20: Sofia Batista + Miguel Batista (criança) + acompanhante
  { id: 'g35', name: 'Sofia Batista', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g36', name: 'Miguel Batista', type: 'child', meal: DUCK, isMain: false, mainGuestId: 'g35' },
  { id: 'g37', name: 'Acompanhante Sofia', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g35' },

  // --- Grupo 21: Bárbara Sousa + Eli Spencer-Gill
  { id: 'g38', name: 'Bárbara Sousa', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g39', name: 'Eli Spencer-Gill', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g38' },

  // --- Grupo 22: Mana + acompanhante
  { id: 'g40', name: 'Mana', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g41', name: 'Cayetano', type: 'adult', meal: BURGER, isMain: false, mainGuestId: 'g40' },

  // --- Grupo 23: Mafalda + Mariana + acompanhante
  { id: 'g42', name: 'Mafalda', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g43', name: 'Mariana', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g42' },
  { id: 'g44', name: 'Acompanhante Mariana', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g42' },

  // --- Grupo 24: Bernardo Niny + Joana Silva
  { id: 'g45', name: 'Bernardo Niny', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g46', name: 'Joana Silva', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g45' },

  // --- Grupo 25: Pedro Silveira + Paula Falcão
  { id: 'g47', name: 'Pedro Silveira', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g48', name: 'Paula Falcão', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g47' },

  // --- Grupo 26: Bruno Araújo + Daniel Oliveira
  { id: 'g49', name: 'Bruno Araújo', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g50', name: 'Daniel Oliveira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g49' },

  // --- Grupo 27: Carolina Rodrigues + João Lopes + acompanhante
  { id: 'g51', name: 'Carolina Rodrigues', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g52', name: 'João Lopes', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g51' },
  { id: 'g53', name: 'Matilde Espírito Santo', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g51' },

  // --- Grupo 28: Rafael Antunes + acompanhante
  { id: 'g54', name: 'Rafael Antunes', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g55', name: 'Acompanhante Rafael', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g54' },

  // --- Grupo 29: Manuel Bernardes + Ana Bernardes
  { id: 'g56', name: 'Manuel Bernardes', type: 'adult', meal: VEG, isMain: true },
  { id: 'g57', name: 'Ana Bernardes', type: 'adult', isMain: false, mainGuestId: 'g56' },

  // --- Grupo 30: Família Tavares/Rocha
  { id: 'g58', name: 'Maria do Carmo Tavares', type: 'adult', isMain: true },
  { id: 'g59', name: 'Luís Tavares', type: 'adult', isMain: false, mainGuestId: 'g58' },
  { id: 'g60', name: 'Sofia Felício', type: 'adult', isMain: false, mainGuestId: 'g58' },
  { id: 'g61', name: 'Tomás Rocha', type: 'adult', dietary: 'Sem pato, porco, coelho, borrego', isMain: false, mainGuestId: 'g58' },
  { id: 'g62', name: 'Margarida Rocha', type: 'adult', meal: VEG, isMain: false, mainGuestId: 'g58' },
  { id: 'g63', name: 'Maria Teresa Rocha', type: 'baby', isMain: false, mainGuestId: 'g58' },

  // --- Grupo 31: Sónia Andrade + Paulo Andrade
  { id: 'g64', name: 'Sónia Andrade', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g65', name: 'Paulo Andrade', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g64' },

  // --- Grupo 32: Beatriz Murtinha + Guilherme Maia + criança + bebé + Alice Maia
  { id: 'g66', name: 'Beatriz Murtinha', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g67', name: 'Guilherme Maia', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g66' },
  { id: 'g68', name: 'Criança Maia', type: 'child', meal: BURGER, isMain: false, mainGuestId: 'g66' },
  { id: 'g69', name: 'Alexandre Maia', type: 'baby', isMain: false, mainGuestId: 'g66' },
  { id: 'g70', name: 'Alice Maia', type: 'adult', meal: VEG, isMain: false, mainGuestId: 'g66' },

  // --- Grupo 33: Madalena Santos + acompanhante
  { id: 'g71', name: 'Madalena Santos', type: 'adult', meal: DUCK, dietary: 'Pescetariana', isMain: true },
  { id: 'g72', name: 'Isabel Silveira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g71' },

  // --- Grupo 34: Família Português
  { id: 'g73', name: 'José Eduardo Português', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g74', name: 'José Maria Português', type: 'child', meal: BURGER, isMain: false, mainGuestId: 'g73' },
  { id: 'g75', name: 'Catarina Português', type: 'adult', meal: DUCK, dietary: 'Sem sopa', isMain: false, mainGuestId: 'g73' },
  { id: 'g76', name: 'Alexandre Português', type: 'adult', meal: DUCK, dietary: 'Sem sopa', isMain: false, mainGuestId: 'g73' },

  // --- Grupo 35: Maria Paula Caldeira + Duarte Mayer
  { id: 'g77', name: 'Maria Paula Caldeira', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g78', name: 'Duarte Mayer', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g77' },

  // --- Grupo 36: Diana Tavares + Maria João Azinheira
  { id: 'g79', name: 'Diana Tavares', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g80', name: 'Maria João Azinheira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g79' },

  // --- Grupo 37: João Teixeira + acompanhante + Marta Ramalho
  { id: 'g81', name: 'João Teixeira', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g82', name: 'Acompanhante João T.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g81' },
  { id: 'g83', name: 'Marta Ramalho', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g81' },

  // --- Grupo 38: Mário Mateus (sozinho)
  { id: 'g84', name: 'Mário Mateus', type: 'adult', meal: DUCK, isMain: true },

  // --- Grupo 39: João Maria Sande e Castro + acompanhante + Mafalda Moura
  { id: 'g85', name: 'João Maria Sande e Castro', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g86', name: 'Acompanhante J.M. Sande', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g85' },
  { id: 'g87', name: 'Mafalda Moura', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g85' },

  // --- Grupo 40: André Abrantes + grupo
  { id: 'g88', name: 'André Abrantes', type: 'adult', isMain: true },
  { id: 'g89', name: 'Sofia Saraiva', type: 'adult', isMain: false, mainGuestId: 'g88' },
  { id: 'g90', name: 'Miguel Cunha', type: 'adult', isMain: false, mainGuestId: 'g88' },
  { id: 'g91', name: 'Luís Paulo', type: 'adult', isMain: false, mainGuestId: 'g88' },

  // --- Grupo 41: Rita Frazoa Tavares + Vasco (bebé)
  { id: 'g92', name: 'Rita Frazoa Tavares', type: 'adult', isMain: true },
  { id: 'g93', name: 'Vasco Frazoa Tavares', type: 'baby', isMain: false, mainGuestId: 'g92' },

  // --- Grupo 42: Maria Prata Rodrigues + André Bernardes + Letícia Bernardes
  { id: 'g94', name: 'Maria Prata Rodrigues', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g95', name: 'André Bernardes', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g94' },
  { id: 'g96', name: 'Letícia Bernardes', type: 'adult', meal: BURGER, isMain: false, mainGuestId: 'g94' },

  // --- Grupo 43: João Maria Sand + Rita Silveira + acompanhante
  { id: 'g97', name: 'João Maria Sand', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g98', name: 'Rita Silveira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g97' },
  { id: 'g99', name: 'Acompanhante Rita S.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g97' },

  // --- Grupo 44: João Bairrada + Rita Cayolla da Mota
  { id: 'g100', name: 'João Bairrada', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g101', name: 'Rita Cayolla da Mota', type: 'adult', meal: DUCK, dietary: 'Intolerância ao glúten', isMain: false, mainGuestId: 'g100' },

  // --- Grupo 45: Luís Ferreira + acompanhante + Maria Sofia + Vasco F. + Teresa F. + acompanhante + Marta Silveira
  { id: 'g102', name: 'Luís Ferreira', type: 'adult', meal: DUCK, dietary: 'Intolerância ao glúten', isMain: true },
  { id: 'g103', name: 'Acompanhante Luís F.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g102' },
  { id: 'g104', name: 'Maria Sofia Cayolla da Motta', type: 'adult', meal: DUCK, dietary: 'Intolerância ao glúten', isMain: false, mainGuestId: 'g102' },
  { id: 'g105', name: 'Vasco Ferreira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g102' },
  { id: 'g106', name: 'Teresa Ferreira', type: 'adult', meal: DUCK, dietary: 'Intolerância ao glúten', isMain: false, mainGuestId: 'g102' },
  { id: 'g107', name: 'Acompanhante Teresa F.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g102' },
  { id: 'g108', name: 'Marta Silveira', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g102' },

  // --- Grupo 46: Rafael João + Francisco Afonso
  { id: 'g109', name: 'Rafael João', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g110', name: 'Francisco Afonso', type: 'adult', meal: BURGER, dietary: 'Sem polvo, lulas, chocos', isMain: false, mainGuestId: 'g109' },

  // --- Grupo 47: crianças avulsas
  { id: 'g111', name: 'Alexandre Silva', type: 'child', meal: BURGER, isMain: true },
  { id: 'g112', name: 'Sofia Gravelho', type: 'child', meal: BURGER, isMain: true },
  { id: 'g113', name: 'Matilde Guerreiro', type: 'child', meal: BURGER, isMain: true },

  // --- Grupo 48: Ricardo Guerreiro + Guilherme Silva + Daniel Silva + acompanhante
  { id: 'g114', name: 'Ricardo Guerreiro', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g115', name: 'Acompanhante Ricardo G.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g114' },
  { id: 'g116', name: 'Guilherme Silva', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g114' },
  { id: 'g117', name: 'Daniel Silva', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g114' },

  // --- Grupo 49: Filipa Rodrigues + Gonçalo Costa + criança
  { id: 'g118', name: 'Filipa Rodrigues', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g119', name: 'Criança Filipa', type: 'child', meal: BURGER, isMain: false, mainGuestId: 'g118' },
  { id: 'g120', name: 'Gonçalo Costa', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g118' },

  // --- Grupo 50: André Gentil + grupo
  { id: 'g121', name: 'André Gentil', type: 'adult', isMain: true },
  { id: 'g122', name: 'Rute Silva', type: 'adult', isMain: false, mainGuestId: 'g121' },
  { id: 'g123', name: 'Marco Pinto', type: 'adult', isMain: false, mainGuestId: 'g121' },
  { id: 'g124', name: 'Gabriel Pinto', type: 'adult', isMain: false, mainGuestId: 'g121' },
  { id: 'g125', name: 'Sara Januário', type: 'adult', isMain: false, mainGuestId: 'g121' },

  // --- Grupo 51: André Sousa + Rita Sousa
  { id: 'g126', name: 'André Sousa', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g127', name: 'Rita Sousa', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g126' },

  // --- Grupo 52: Pedro Pereira + Inês Ramalho
  { id: 'g128', name: 'Pedro Pereira', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g129', name: 'Inês Ramalho', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g128' },

  // --- Grupo 53: Pedro Pampulha + Filipa Verganista + acompanhante
  { id: 'g130', name: 'Pedro Pampulha', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g131', name: 'Filipa Verganista', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g130' },
  { id: 'g132', name: 'Acompanhante Filipa V.', type: 'adult', meal: DUCK, isMain: false, mainGuestId: 'g130' },

  // --- Grupo 54: Patrício Silveira + Cátia Barcelos + Nuno Barcelos
  { id: 'g133', name: 'Patrício Silveira', type: 'adult', meal: DUCK, isMain: true },
  { id: 'g134', name: 'Cátia Barcelos', type: 'adult', isMain: false, mainGuestId: 'g133' },
  { id: 'g135', name: 'Nuno Barcelos', type: 'adult', isMain: false, mainGuestId: 'g133' },
];
