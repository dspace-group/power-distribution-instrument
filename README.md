# power-distribution-instrument
This is an instrument for dSPACE ControlDesk to visualize power distribution.

![](anim.mkv)

## Build instrument from scratch

Add the following Custom Properties:

bi.CustomProperties.Add(3, "Number of Nodes").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Number of Links").Category = "Power Distribution"
bi.CustomProperties.Add(1, "Unit").Category = "Power Distribution"
bi.CustomProperties.Add(3, "Digits").Category = "Power Distribution"