const CODE_PREFIX_RE = /^(import |const |let |var |function |class |\/\/|#!|{|}|\[|\])/;
const PATH_RE = /^[\/~.].*\.[a-z]{1,4}$/i;
const COMMAND_PREFIX_RE = /^(git |npm |pnpm |yarn |node |cd |ls |cat |mkdir |rm |touch |cp |mv |grep |find |echo |sed |awk |curl |wget |ssh |docker |kubectl )/;

export function looksLikeCode(text: string): boolean {
  return CODE_PREFIX_RE.test(text.trim());
}

export function looksLikePath(text: string): boolean {
  return PATH_RE.test(text.trim());
}

export function looksLikeCommand(text: string): boolean {
  return COMMAND_PREFIX_RE.test(text.trim());
}

export function looksLikeNonProse(text: string): boolean {
  const t = text.trim();
  return CODE_PREFIX_RE.test(t) || PATH_RE.test(t) || COMMAND_PREFIX_RE.test(t);
}

export function englishRatio(text: string): number {
  const alpha = (text.match(/[a-zA-Z]/g) || []).length;
  const total = text.replace(/\s/g, '').length;
  return total > 0 ? alpha / total : 0;
}
