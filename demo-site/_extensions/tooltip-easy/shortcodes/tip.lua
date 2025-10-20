-- _extensions/tooltip-easy/shortcodes/tip.lua
local function ensure_deps()
  if not quarto.doc.is_format("html:js") then return end
  quarto.doc.add_html_dependency({
    name = "tooltip-easy",
    version = "1.0.0",
    scripts = { "tip.js" },
    stylesheets = { "tip.css" }
  })
end

local function random_id()
  local n = math.random(10000000, 99999999)
  return "tip-" .. tostring(n)
end

local function esc(s)
  s = tostring(s or "")
  s = s:gsub("&","&amp;"):gsub("<","&lt;"):gsub(">","&gt;"):gsub('"',"&quot;"):gsub("'","&#39;")
  return s
end

return {
  ["tip"] = function(args, kwargs, meta)
    ensure_deps()
    local label = pandoc.utils.stringify(kwargs["label"])
    if label == "" then label = "Quarto +1" end

    local content_id = pandoc.utils.stringify(kwargs["content-id"])
    if content_id == "" then
      content_id = pandoc.utils.stringify(kwargs["content_id"])
    end

    local id = pandoc.utils.stringify(kwargs["id"])
    if id == "" then id = random_id() end

    local trigger   = pandoc.utils.stringify(kwargs["trigger"])
    local placement = pandoc.utils.stringify(kwargs["placement"])
    local theme     = pandoc.utils.stringify(kwargs["theme"])
    local animation = pandoc.utils.stringify(kwargs["animation"])
    local maxwidth  = pandoc.utils.stringify(kwargs["maxwidth"])
    local nav       = pandoc.utils.stringify(kwargs["nav"])

    local function data_attr(name, value)
      if value ~= nil and value ~= "" then
        return string.format(' data-%s="%s"', name, esc(value))
      else
        return ""
      end
    end

    local html = string.format([[
<span class="qtip" data-tip-id="%s" data-content-id="%s"%s%s%s%s%s>
  <button type="button" class="qtip__btn">%s</button>
</span>]],
      esc(id),
      esc(content_id),
      data_attr("trigger", trigger),
      data_attr("placement", placement),
      data_attr("theme", theme),
      data_attr("animation", animation),
      data_attr("nav", nav),
      esc(label)
    )

    return pandoc.RawInline("html", html)
  end
}