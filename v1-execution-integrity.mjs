/**
 * Pure Robinhood v1 fill reconciliation: verifies the list of individual broker
 * executions agrees with cumulative filled quantity and average execution price.
 * No network, no account writes, and no order submissions.
 *
 * Broker v1 may omit explicit fee_charged (spread-inclusive pricing). Missing
 * explicit fees are normalized separately and NEVER inferred as V2 tier fees.
 */
const strictDecimal = /^(?:0|[1-9]\d*)(?:\.\d+)?$|^\.\d+$/;
const n=x=>(typeof x==='number'&&Number.isFinite(x))?x:
 (typeof x==='string'&&strictDecimal.test(x.trim())&&Number.isFinite(Number(x)))?Number(x):NaN;
const approximately=(a,b)=>Math.abs(a-b)<=Math.max(1e-8,1e-6*Math.max(Math.abs(a),Math.abs(b)));
export function auditV1Executions(order) {
 if(!order||typeof order!=='object'||Array.isArray(order))
  return {ok:false,reason:'INVALID_V1_ORDER'};
 const filled=n(order.filled_asset_quantity??0),avg=n(order.average_price??0);
 if(!Number.isFinite(filled)||filled<0||!Number.isFinite(avg)||avg<0||(filled>0&&avg<=0))
  return {ok:false,reason:'INVALID_V1_CUMULATIVE_FILL'};
 if(!Array.isArray(order.executions))
  return {ok:false,reason:'V1_EXECUTION_DETAILS_MISSING'};
 if(order.executions.length>10000)
  return {ok:false,reason:'V1_EXECUTION_DETAILS_UNBOUNDED'};
 let qty=0,gross=0;
 const ids=new Set();
 for(const e of order.executions){
  if(!e||typeof e!=='object'||Array.isArray(e))
   return {ok:false,reason:'INVALID_V1_EXECUTION'};
  const q=n(e.quantity),p=n(e.effective_price);
  if(!(q>0)||!(p>0))return {ok:false,reason:'INVALID_V1_EXECUTION'};
  if(e.id!=null){
   if(typeof e.id!=='string'||!e.id||ids.has(e.id))
    return {ok:false,reason:'DUPLICATE_V1_EXECUTION_ID'};
   ids.add(e.id);
  }
  qty+=q;gross+=q*p;
  if(!Number.isFinite(qty)||!Number.isFinite(gross))
   return {ok:false,reason:'INVALID_V1_EXECUTION_TOTALS'};
 }
 if(!approximately(qty,filled))return {ok:false,reason:'V1_EXECUTION_QUANTITY_MISMATCH'};
 // All executed prices already incorporate spread; compare weighted price
 // to broker's cumulative average without treating spread as a separate fee.
 if(filled>0&&!approximately(gross,filled*avg))
  return {ok:false,reason:'V1_EXECUTION_VALUE_MISMATCH'};
 return Object.freeze({ok:true,filledQuantity:filled,weightedGrossUsd:gross,
  executionCount:order.executions.length});
}
