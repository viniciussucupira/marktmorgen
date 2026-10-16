import { assessProfitCoverage } from "@/lib/profit-coverage";
const object=(value:unknown):value is Record<string,unknown>=>!!value&&typeof value==="object"&&!Array.isArray(value);
const label=(value:unknown)=>typeof value==="string"?value:null;
export function profitAuditReport(raw:unknown,nowSeconds=Math.floor(Date.now()/1000)){
  const coverage=assessProfitCoverage(raw,nowSeconds);
  const rows=object(raw)&&Array.isArray(raw.scenarios)?Array.from(raw.scenarios):[];
  const diagnostics=rows.map((rawRow,index)=>{
    const row=object(rawRow)?rawRow:{};
    const assessment=coverage.assessments[index];
    const rowKey=JSON.stringify([row.scope,row.reference,row.scenario]);
    const issues=coverage.reasons.filter(reason=>reason.endsWith(":"+rowKey));
    const identity={index,scope:label(row.scope),reference:label(row.reference),scenario:label(row.scenario),plan:label(row.plan),cycle:label(row.cycle)};
    if(issues.length||!assessment||assessment.status==="unverified")return {...identity,arithmeticStatus:"unverified" as const,reason:issues.length?issues.join(", "):assessment?.status==="unverified"?assessment.reason:"portfolio_preflight_unverified",totalCostCents:null,netProfitCents:null,costHeadroomCents:null,excessCostCents:null,requiredRevenueAtUnchangedCostsCents:null,additionalRevenueAtUnchangedCostsCents:null};
    const revenue=row.retainedRevenueCents as number;
    const cost=BigInt(assessment.totalCostCents);
    const minimum=cost===BigInt(0)?BigInt(1):(cost*BigInt(5)+BigInt(1))/BigInt(2);
    const shortfall=minimum>BigInt(revenue)?minimum-BigInt(revenue):BigInt(0);
    return {...identity,arithmeticStatus:assessment.status,reason:null,totalCostCents:assessment.totalCostCents,netProfitCents:assessment.netProfitCents,costHeadroomCents:assessment.maximumCostCents-assessment.totalCostCents,excessCostCents:Math.max(0,assessment.totalCostCents-assessment.maximumCostCents),requiredRevenueAtUnchangedCostsCents:String(minimum),additionalRevenueAtUnchangedCostsCents:String(shortfall)};
  });
  return {...coverage,diagnostics,calculationNotice:"A receita calculada supõe custos e impostos inalterados. Não é preço recomendado nem aprovação financeira: mudar preços pode mudar impostos, taxas, procura e custos. Refaça a avaliação com evidências reais. O resultado geral inclui cobertura e validação da receita; o status aritmético de uma linha não aprova essa linha."};
}
const clean=(value:string|null)=>value===null?"não identificado":value.replace(/[\r\n\t]/g," ");
const dollars=(cents:string|number)=>{const value=BigInt(cents);const negative=value<BigInt(0);const amount=negative?-value:value;return (negative?"-":"")+"USD "+String(amount/BigInt(100))+"."+String(amount%BigInt(100)).padStart(2,"0");};
export function formatProfitAuditText(report:ReturnType<typeof profitAuditReport>):string{
  const lines=[report.meetsPolicy?"Os dados declarados atendem ao critério; não há certificação financeira.":"O critério financeiro não foi comprovado.","Cenários informados: "+report.diagnostics.length,"Pendências gerais: "+(report.reasons.join(", ")||"nenhuma detectada"),"Combinações obrigatórias ausentes: "+report.missing.length];
  for(const row of report.diagnostics){
    if(row.arithmeticStatus==="meets_floor")continue;
    lines.push("",clean(row.scope)+" / "+clean(row.reference)+" / "+clean(row.scenario));
    if(row.arithmeticStatus==="unverified")lines.push("Valores não comprovados: "+row.reason);
    else lines.push("Custo acima do limite: "+dollars(row.excessCostCents!),"Receita necessária com custos e impostos inalterados: "+dollars(row.requiredRevenueAtUnchangedCostsCents!),"Receita adicional nessa mesma hipótese: "+dollars(row.additionalRevenueAtUnchangedCostsCents!));
  }
  lines.push("",report.calculationNotice);
  return lines.join("\n");
}
