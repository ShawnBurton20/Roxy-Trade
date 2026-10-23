/**
 * Pure V1 single-use owner-authorization checks for offline/staged review.
 * This module does NOT grant leases or enable trading. A database-backed,
 * atomic consumption operation and immediate pre-send recheck are mandatory.
 */
const uuid=/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const sha256=/^[0-9a-f]{64}$/;
const positive=x=>typeof x==='number'&&Number.isFinite(x)&&x>0;
const number=x=>x===null||x===undefined||x===''?NaN:Number(x);
const instant=x=>Date.parse(typeof x==='string'?x:'');
const deny=reason=>Object.freeze({ok:false,reason});

/**
 * Strictly enforce the existing read-only-verified DB row contract:
 * one DOGE-USD V1 supervised BUY, signed release hash, 10-minute maximum
 * lease and $0.25-or-less order. This is NOT broker authorization by itself.
 */
export function validateOneShotApproval({lease,ownerId,releaseSha256,route,symbol,side,
  notionalUsd,observedSpreadPct,dbMaxSpreadPct,now=Date.now(),
  consumedOrderId=null}={}) {
 if(!lease||typeof lease!=='object')return deny('APPROVAL_MISSING');
 if(!uuid.test(String(lease.id||''))||!uuid.test(String(ownerId||''))||
  lease.user_id!==ownerId||lease.granted_by!==ownerId)
  return deny('APPROVAL_OWNER_OR_ID_MISMATCH');
 if(lease.purpose!=='one_v1_supervised_limit_buy'||
    lease.route!=='ROBINHOOD_V1_MARKET_MAKER'||
    lease.symbol!=='DOGE-USD'||lease.side!=='buy'||lease.max_orders!==1 ||
    route!==lease.route||symbol!==lease.symbol||side!==lease.side)
  return deny('APPROVAL_SCOPE_MISMATCH');
 if(!sha256.test(String(releaseSha256||''))||lease.release_sha256!==releaseSha256)
  return deny('APPROVAL_RELEASE_MISMATCH');
 const granted=instant(lease.granted_at),expires=instant(lease.expires_at);
 if(!Number.isFinite(now)||!Number.isFinite(granted)||!Number.isFinite(expires)||
    granted>now||now>=expires||expires<=granted||expires-granted>600000)
   return deny('APPROVAL_EXPIRED_OR_CLOCK_INVALID');
 if(lease.revoked_at!==null&&lease.revoked_at!==undefined)
  return deny('APPROVAL_REVOKED');
 if(consumedOrderId===null){
  if(lease.consumed_at!=null||lease.consumed_order_id!=null)return deny('APPROVAL_ALREADY_USED');
 }else{
  if(!uuid.test(String(consumedOrderId))||lease.consumed_order_id!==consumedOrderId||
     !Number.isFinite(instant(lease.consumed_at))||instant(lease.consumed_at)>now||
     instant(lease.consumed_at)<granted)
    return deny('APPROVAL_NOT_CONSUMED_FOR_ORDER');
 }
 const maxN=number(lease.max_notional_usd),maxS=number(lease.max_spread_pct);
 if(!positive(maxN)||maxN>.25||!positive(maxS)||maxS>2 ||
  !positive(number(dbMaxSpreadPct))||number(dbMaxSpreadPct)>2)
  return deny('APPROVAL_LIMITS_INVALID');
 if(!positive(number(notionalUsd))||number(notionalUsd)>maxN+1e-10 ||
    number(notionalUsd)>.25+1e-10)
  return deny('APPROVAL_NOTIONAL_EXCEEDED');
 if(!Number.isFinite(number(observedSpreadPct))||number(observedSpreadPct)<0||
    number(observedSpreadPct)>Math.min(maxS,number(dbMaxSpreadPct))+1e-9)
  return deny('APPROVAL_SPREAD_EXCEEDED');
 return Object.freeze({ok:true,approvalId:lease.id,expiresAt:lease.expires_at,
  maxNotionalUsd:maxN,maxSpreadPct:Math.min(maxS,number(dbMaxSpreadPct))});
}
