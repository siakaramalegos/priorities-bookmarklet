const container=document.createElement("div")
container.style["padding"] = "20px"
container.style["z-index"] = "9999"
container.style["background-color"] = "#FFF"
container.style["color"] = "#222"
container.style["box-shadow"] = "0 3px 6px rgba(0,0,0,.15), 0 2px 4px rgba(0,0,0,.12)"
container.style["position"] = "absolute"
container.style["inset"] = "20px"
container.style["overflow"] = "scroll"
container.style["font-size"] = "16px"

const h1 = document.createElement("h1")
h1.innerHTML = "Priorities Scanner Results"
h1.style["font-size"] = "24px"
const info = document.createElement("p")
info.innerHTML = 'Refresh the page to remove this overlay. <a href="https://projects.sia.codes/priorities-bookmarklet/">Share</a> this bookmarklet.'
container.append(h1)
container.append(info)

const FETCHPRIORITY_CHECKS = [
  {
    selector: '[fetchpriority="high"]',
    headingText: "Elements with fetchpriority set to high:"
  },
  {
    selector: '[fetchpriority="low"]',
    headingText: "Elements with fetchpriority set to low:"
  },
]

FETCHPRIORITY_CHECKS.forEach(check => {
  const nodelist = document.querySelectorAll(check.selector)

  const heading=document.createElement("h2")
  heading.innerHTML = check.headingText
  heading.style["font-size"] = "20px"
  const ol = document.createElement("ol")

  nodelist.forEach(e => {
    const li = document.createElement("li")
    const value = e.href ? `with href="${e.href}"` : `with src="${e.src}"`
    li.innerHTML = `${e.nodeName} ${value}`
    ol.append(li)
  })

  container.append(heading)
  container.append(ol)
})

const CHECKS = [
  {
    selector: 'link[rel="preload"]',
    headingText: "Preloaded assets:"
  },
  {
    selector: 'link[rel="prefetch"]',
    headingText: "Prefetched assets:"
  },
  {
    selector: 'link[rel="preconnect"]',
    headingText: "Preconnected domains:"
  },
  {
    selector: 'link[rel="dns-prefetch"]',
    headingText: "DNS-prefetched domains:"
  }
]

CHECKS.forEach(check => {
  const nodelist = document.querySelectorAll(check.selector)

  const heading=document.createElement("h2")
  heading.innerHTML = check.headingText
  heading.style["font-size"] = "20px"
  const ol = document.createElement("ol")

  nodelist.forEach(e => {
      const li = document.createElement("li")
      li.innerHTML = e.href
      ol.append(li)
  })

  container.append(heading)
  container.append(ol)
})

document.querySelector("body").prepend(container)
