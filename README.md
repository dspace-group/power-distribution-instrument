# power-distribution-instrument
This is an instrument for [dSPACE ControlDesk](https://www.dspace.com/en/inc/home/products/sw/experimentandvisualization/controldesk.cfm) to visualize power distribution.

![anim](https://github.com/dspace-group/power-distribution-instrument/assets/9103508/d3751df9-ea99-402a-9847-6813866bf24b)

## ControlDesk: Build Power Distribution Instrument from scratch

1. Get this repo
2. Open ControlDesk and drag'n'drop a Browser Instrument into your Layout
3. Enter the path of the power_dist.html-file into the Browser Instrument address bar
4. Add custom properties to the Browser Instrument. To do so: Drag & drop the Browser Instrument into the Interpreter-pane. The Instrument gets converted into a line of Python code. This code returns an object that represents the Instrument. Use the Interpreter to add new custom properties. Your Interpreter-pane should look like the following:
```
bi = Application.LayoutManagement.Layouts["Layout1"].Instruments["Browser_5"]

bi.CustomProperties.Add(3, "Number of Nodes").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Number of Links").Category = "Power Distribution"
bi.CustomProperties.Add(1, "Unit").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Digits").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Min").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Max").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Width").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Height").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Padding").Category = "Power Distribution"
```
5. Open the Script-property and replace the default script by the content of the power_dist.py-script from this repo.

## Acknowledgement

Powered by [D3.js](https://d3js.org/).
