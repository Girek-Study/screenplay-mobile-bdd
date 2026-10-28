// En WebdriverIO v9 `ChainablePromiseElement` dejó de ser genérico: tiparlo como
// antes (`ChainablePromiseElement<WebdriverIO.Element>`) compila en v8 y falla en v9.
export type ElementoCualquiera = WebdriverIO.Element | ChainablePromiseElement;
