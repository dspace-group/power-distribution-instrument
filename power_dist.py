# Available global variables:

# Application - The Application object.
# Instrument - The Instrument object.

from win32com.client import Dispatch, DispatchWithEvents
import random, json

EXAMPLE_TERMS = ["Robot", "Conveyor", "PLC", "Scanner", "Actuator", "Cobot", "AGV", "Sensor", "HMI", "Servo", "CNC", 
                 "Manipulator", "Actuator", "Stepper", "VFD", "Gripper", "DCS", "Inverter", "Encoder", "Feeder", 
                 "Engine", "ECU", "ABS", "Airbag", "Turbo", "Differential", "Injector", "Transmission", "Hybrid", 
                 "Throttle", "Steering", "CVT", "Catalytic", "OBD", "TPMS", "Cruise", "Ignition", "Suspension", 
                 "Radiator", "Fuel pump", "Lathe", "Milling", "Router", "Oscilloscope", "Multimeter", "Press", 
                 "Gearbox", "Motor", "Pump", "Exchanger", "Oven", "Fan", "3D Printer", "Welder", "Solder", "Cutter", 
                 "Conveyor", "Generator", "HVAC", "Compressor", "Solar", "Wind", "Battery", "Inverter", "Rainwater", 
                 "Geothermal", "Charger", "Composter", "Gasifier", "Thermostat", "Lighting", "Controls", "Heater",
                 "Turbine", "Emission", "Digester", "Ventilator", "Irrigation", "Purifier", "Composter"]

class InstrumentEvents(object):
    def __init__(self):
        sender = Dispatch(Instrument)
        
        # update HTML/JS
        nodes_data = [{"id": cp.Value, "r": 40} for cp in sender.CustomProperties if cp.Name == "Node"]
        edges_data = [{"value": 0, "source":cp.Value.split("->")[0], "target":cp.Value.split("->")[1]} for cp in sender.CustomProperties if cp.Name == "Link" and cp.Value.split("->")[0] in [n["id"] for n in nodes_data] and cp.Value.split("->")[1] in [n["id"] for n in nodes_data]]
        cps = { cp.Name:cp for cp in sender.CustomProperties}
        
        for cpName in ["Unit", "Digits", "Min", "Max", "Width", "Height", "Padding"]:
            Instrument.InvokeScript('setParam', (cps[cpName].Name.lower(), cps[cpName].Value))        
        Instrument.InvokeScript('configureJson', (json.dumps(nodes_data), json.dumps(edges_data), ))
        Instrument.InvokeScript('animate', ())
        
    def OnCustomPropertyChanged(self, sender_, customProperty_, action):
        if action != 0: return

        customProperty = Dispatch(customProperty_)
        sender = Dispatch(sender_)
        
        #
        # Add and remove "Nodes" and "Links"
        #
        nodesCp = list(filter(lambda cp: cp.Name == "Node", sender.CustomProperties))
        linksCp = list(filter(lambda cp: cp.Name == "Link", sender.CustomProperties))
            
        if customProperty.Name == 'Number of Nodes':
            customProperty.Value = 0 if customProperty.Value < 0 else customProperty.Value
            customProperty.Value = len(EXAMPLE_TERMS) if customProperty.Value > len(EXAMPLE_TERMS) else customProperty.Value
            
            diff = customProperty.Value - len(nodesCp)
            if diff > 0: # add Node CPs
                for idx in range(0, diff):
                    prop = sender.CustomProperties.Add(1, "Node")
                    prop.Category = "Power Distribution Nodes"
                    # find default node value
                    usedValues = [cp.Value for cp in nodesCp]
                    nameCandidate = ""
                    while nameCandidate == "" or nameCandidate in usedValues: # avoid same names
                        nameCandidate = random.choice(EXAMPLE_TERMS)
                    prop.Value = nameCandidate
                    
            elif diff < 0: # remove Node CPs
                for idx in range(0, abs(diff)):
                    idx = [cp for cp in sender.CustomProperties].index(nodesCp.pop())
                    sender.CustomProperties.Delete(idx)
                   
        elif customProperty.Name == 'Number of Links':
            customProperty.Value = 0 if customProperty.Value < 0 or len(nodesCp) == 0 else customProperty.Value
            
            diff = customProperty.Value - len(linksCp)
            if diff > 0: # add Link CPs
                for idx in range(0, diff):
                    prop = sender.CustomProperties.Add(1, "Link")
                    prop.Category = "Power Distribution Links"
                    
                    # find default link value
                    usedValues = [cp.Value for cp in list(filter(lambda cp: cp.Name == "Link", sender.CustomProperties))]
                    nameCandidate = ""
                    while nameCandidate == "" or nameCandidate in usedValues:
                        nameCandidate = random.choice(EXAMPLE_TERMS) + "->" + random.choice(EXAMPLE_TERMS)
                        usedValues = [cp.Value for cp in list(filter(lambda cp: cp.Name == "Link", sender.CustomProperties))]
                    prop.Value = nameCandidate
            elif diff < 0: # remove Link CPs
                for idx in range(0, abs(diff)):
                    idx = [cp for cp in sender.CustomProperties].index(linksCp.pop())
                    sender.CustomProperties.Delete(idx)

        elif customProperty.Name == 'Node':
            nodeProps = [cp for cp in sender.CustomProperties if cp.Name == "Node"]
            nodeProps.remove(customProperty)
            nodeNames = [np.Value for np in nodeProps]
            while customProperty.Value in nodeNames: # avoid same names
                customProperty.Value = random.choice(EXAMPLE_TERMS)
        else:
            Instrument.InvokeScript('setParam', (customProperty.Name.lower(), customProperty.Value))
        
        #
        # Sync ConnectionNodes with "Link"-custom properties
        #
        linkProps = [cp for cp in sender.CustomProperties if cp.Name == "Link"]
        connNodes = {cn.UniqueName: cn for cn in sender.ConnectionNodes}

        linkPropsNames = [np.Value for np in linkProps]
        connNodesNames = [key for key in connNodes]
        
        toAdd = set(linkPropsNames).difference(set(connNodesNames))
        toRemove = set(connNodesNames).difference(set(linkPropsNames))
        
        for cnName in toAdd:
            cn = sender.ConnectionNodes.Add()
            cn.UniqueName = cnName
        for cnName in toRemove:
            connNodes[cnName].Delete()
        
        # update HTML/JS
        nodes_data = [{"id": cp.Value, "r": 40} for cp in sender.CustomProperties if cp.Name == "Node"]
        edges_data = [{"value": 0, "source":cp.Value.split("->")[0], "target":cp.Value.split("->")[1]} for cp in sender.CustomProperties if cp.Name == "Link" and cp.Value.split("->")[0] in [n["id"] for n in nodes_data] and cp.Value.split("->")[1] in [n["id"] for n in nodes_data]]
        
        Instrument.InvokeScript('configureJson', (json.dumps(nodes_data), json.dumps(edges_data), ))
        Instrument.InvokeScript('animate', ())

    def OnConnectionAdded(self, sender, connectionObject, propertyName, variable):
        pass
    def OnConnectionAdding(self, sender, connectionObject, propertyName, variable, connectionAddingEventArgument):
        pass
    def OnConnectionDeleted(self, sender, connectionObject, propertyName, variable):
        pass
    def OnConnectionDeleting(self, sender, connectionObject, propertyName, variable):
        pass
    def OnDataReceived(self, sender, key, value):
        pass
    def OnDeleting(self, sender):
        pass
    def OnKeyDown(self, sender, key, modifierKeys):
        pass
    def OnKeyPress(self, sender, keyChar):
        pass
    def OnKeyUp(self, sender, key, modifierKeys):
        pass
    def OnMouseClick(self, sender, mouseButton, x, y, modifierKeys):
        pass
    def OnMouseDoubleClick(self, sender, mouseButton, x, y, modifierKeys):
        pass
    def OnMouseDown(self, sender, mouseButton, x, y, modifierKeys):
        pass
    def OnMouseEnter(self, sender):
        pass
    def OnMouseHover(self, sender):
        pass
    def OnMouseLeave(self, sender):
        pass
    def OnMouseMove(self, sender, x, y, modifierKeys):
        pass
    def OnMouseUp(self, sender, mouseButton, x, y, modifierKeys):
        pass
    def OnMouseWheel(self, sender, delta, modifierKeys):
        pass
    def OnSelectionStateChanged(self, sender, isSelected):
        pass
    def OnUrlChanged(self, sender, url):
        pass
    def OnValidStateChanged(self, sender, connectionObject, propertyName, variable, isValid):
        pass

InstrumentWithEvents = DispatchWithEvents(Instrument, InstrumentEvents)
