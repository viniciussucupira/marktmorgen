# AB(a): retorno da instalação Discord vinculado à coorte paga
28/10/2026. Base6400f949. Implementação parcial; nenhuma cobertura ou revisão aprovada.

## Limite encontrado e correção
O início da instalação já exige coorte paga, mas um estadoOAuth válido pode voltar depois de mudar ou faltar a aprovação financeira. O callback de instalação trocava código por credenciais e podia substituir o servidor sem repetir essa prova. Agora o retorno do criador marcado exige reservePaidResourceWindow depois de sessão/permissão/código válidos e antes de exchange,readServer,forgetServer,leaveServer,saveServer e aviso.

O estado continua de uso único e duração existente; nenhuma nova chave ou protocolo. Recusa não é autorização para repetir a troca de código. Cancelamento e código inválido seguem os resultados existentes, antes da guarda. O ramo de comprador permanece separado: este passo não muda acesso adquirido. Remoção de papéis e desconexão existentes ficam intactas.

## Custos antes da operação
Uma avaliação adicional da coorte por retorno de instalação marcado que alcança a fronteira; máximo teórico18comandos na primeira observação ou17repetidos, corpo12288bytes e coorte existente. Nenhuma nova chamadaDiscord; a troca e eventual limpeza já existiam. O início já usa a franquia de integrações50/200/500, mas isso sozinho não prova teto global de callbacks/recusas/replicação/CPU/tráfego.

Com50/200/500retornos aceitos num pior mês, apenas a parcela de comandos adicionais de uma primária sem réplica aUS$0,20/100mil seriaUS$0,0018/0,0072/0,018por mês eUS$0,0216/0,0864/0,216por12meses, porStore/Studio/Scale em cada intervalo. Não são totais ou tetos aprovados: maior preço pago vigente, topologia e todos os custos ainda precisam prova. Totais desconhecidos reprovam; políticas reais continuamnull e não se habilita instalação real. Nenhum contrato/conta/serviço/custo fixo novo.

## Verificação
Teste da rota real com sessão/estado sintéticos válidos emitidos antes da fronteira:sem aprovação,303para studio/limited,zero troca de código/chamadaDiscord,servidor preservado e franquia não consumida. Replay expira;cancelamento e código inválido mantêm seus resultados semprovider. Testes existentes de remoção/disconnect/entitlement permanecem. Suíte integral hospedada exigida no novohead; nenhum teste local ouOAuthreal. Não concluirAB(a),renovação,conciliação,impostos,margem ou abertura. Preços,direitos,conteúdo,idiomas,identificadores e flags preservados.
