const container=document.createElement("div")
const fetchpriorityList = document.querySelectorAll("[fetchpriority]")

const heading=document.createElement("p")
heading.innerHTML = "Elements with fetchpriority set:"
const ol = document.createElement("ol")

fetchpriorityList.forEach(e => {
    const li = document.createElement("li")
    const value = e.href ? `with href="${e.href}"` : `with src="${e.src}"`
    li.innerHTML = `${e.nodeName} ${value}`
    ol.append(li)
})

container.append(heading)
container.append(ol)

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

  const heading=document.createElement("p")
  heading.innerHTML = check.headingText
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
