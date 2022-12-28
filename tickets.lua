require "Tickets-System/spawnwave"

playertypes = {} -- List to hold all player roles. Playerid will be used as index for the list. The value of the index is the player's role
mtftext, chaostext = 0
debounce = false

function OnScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, tickets.lua is bugged
    print("Tickets")
    ScriptLoaded()
    return -1
end

function GetTeam(role)
    local scps = {5,6,10,11,12,14,15,16} --Skip role 13 cause idk
    local found = {1,2,4,8,9,0,0,0}
    local cd = {3,7,0,0,0,0,0,0} --Looks familiar?
    
    for y = 1, 8 do
        local select = {
            [scps[y]] = "scp",
            [found[y]] = "found",
            [cd[y]] = "chaos"
        }
        if type(select[role]) == "string" then return select[role] end
    end
    return false --Catchall
end

function OnPlayerGetNewRole(player,_,role)
    timer = function()
        playertypes[player] = role --Add their role to the list under the playerid
    end
    createtimer("timer",2000,0)
    
    return -1
end

function OnPlayerConnect(plr) OnPlayerGetNewRole(plr,_,0); return -1 end

function OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetTeam(shooter)
    local role = playertypes[shootee] --find shootee role from list
        
    if killerrole == "chaos" then --if CD team
        if GetTeam(role) == "found" or role == 13 then chaosticks = chaosticks + 1 --If died is Security plr or SCP 049-2
        elseif GetTeam(role) == "scp" then chaosticks = chaosticks + 2 end --if died is SCP

    elseif killerrole == "found" then --If Foundation
        if role == 7 or role == 13 then mtfticks = mtfticks + 1 --Dont get tickets for killing "innocent" Class D
        elseif GetTeam(role) == "scp" then mtfticks = mtfticks + 3 end
        --They can get paid now
    end
        
    return -1
end

function OnPlayerEscape(_,escaped) 
    if escaped == 7 then chaosticks = chaosticks + 2
    elseif escaped == 1 then mtfticks = mtfticks + 2 end
    return -1
end

function spawntimer(mins,secs) --looks familiar. Creates a timer which at end of spawns team with most tickets.
    if not debounce then return -1 end

    mins,secs = tonumber(mins),tonumber(secs)
    local sec

    if secs < 10 then sec = "0"..secs --declare display variable
    else sec = secs end

    local spawntext = string.format("Next Reinforcement Spawn wave in %d:%s",mins,sec) --Reinforcement timer text

    if secs == 0 then
        if mins == 0 then --if mins and secs = 0, timer finished
            spawnwave()
            spawntimer(5,0)
            return -1 --timer finished
        else --if mins didnt equal 0, then a minute passed , subtract 1 from min and reset secs
            mins = mins - 1
            secs = 60
        end
    end

    recursive = function() spawntimer(mins,secs-1); return -1 end
    createtimer("recursive", 1000, 0) --restart function with secs - 1

    wipeout = function(plr,txt) 
        plr,txt = tonumber(plr),tonumber(txt)
        if isplayerconnected(plr) == 1 then removeplayertext(plr,txt) end
        return -1
    end

    plr_loop(function(plr)
        if getplayertype(plr) ~= 0 then return end

        local screen_width = getplayermonitorwidth(plr)
        local screen_height = getplayermonitorheight(plr)
        sec = createplayertext(plr, spawntext, screen_width/45, screen_height/8,  123456, "DS-DIGITAL.ttf",50) -- text to wipe
        createtimer("wipeout",1000,0,plr,sec)
    end)
    
    return -1
end

function spawnwave()
    if chaosticks > mtfticks then spawnchaos() else spawnmtf() end
end

function spawnfix()
    debounce = true
    spawntimer(5,0)
    return -1
end

function OnActivateWarheads() debounce = false; return -1 end --All units retreat, alpha warheads activated.    

function OnServerRestart() debounce = false; return -1 end --If the server for some reason doesnt activate warheads before restarting, disable spawn anyway

function OnDeactivateWarheads() spawnfix(); return -1 end --All units return, warheads disabled

function OnRoundStarted()
    mtfticks = 24
    chaosticks = 18 -- Default values for tickets
    createtimer("breakspawn",5000,0) -- Good luck using the old spawn system without tickets
    
    spawnfix() -- Start spawn timer
    return -1
end

----------Commands------------
function OnPlayerConsole(plr,msg) --bunch of commands to override the old ones

    function spawncommand(team)
        local txt, tickets

        if team == "mtf" then tickets = mtfticks
        else tickets = chaosticks end

        if tickets < 0 then txt = "[Tickets] Listen to RCON"
        else
            debounce = false
            createtimer("spawn"..team,0,0) --Easier to set spawnwave as string
            createtimer("spawnfix",2000,0) -- Fix spawntimer
            txt = string.format("[Ignore RCON] %s Successfully Spawned",team)
        end

        sendmessage(plr, txt)
    end

    local select = {
        ["spawnmtf"] = function() spawncommand("mtf") end, -- Spawn MTF Wave
        ["spawnchaos"] = function() spawncommand("chaos") end, -- Spawn Chaos Wave
        ["spawnwave"] = function() -- Spawn Team with most tickets (MTF will spawn if tickets are equal)
            debounce = false -- Disable spawntimer
            if chaosticks > mtfticks then spawncommand("chaos")
            else spawncommand("mtf") end
        end
    }
    msg = string.lower(msg:gsub("%s+","")) -- Strip and lower command
    if type(select[msg]) == "function" then select[msg]() end
    
    local settickets = function(txt)
        msg = string.gsub(msg, "%D",'') --For some reason, using tonumber() here adds one to the number given. %D targets all non-number (or decimal) characters. %d would target numbers
        if type(tonumber(msg)) ~= "nil" then
            msg = tonumber(msg)
            servermessage("[REINFORCEMENTS] "..string.format(txt,msg))
            return msg
        else
            sendmessage(plr, "[Tickets-System] Error, Parameter Invalid. "..string.format(txt,15))
            return 15
        end
        -- .gsub() basically deletes all non-number characters in this case. Technically if u write 1setmtftickets 10, you just set mtfticks to 110
    end
 
    if string.find(msg, "setmtftickets") then mtfticks = settickets("MTF Tickets set to %d")
    elseif string.find(msg, "setchaostickets") then chaosticks = settickets("Chaos Tickets set to %d")
    elseif string.find(msg, "spawntimer") then
        debounce = false
        newspawnfix = function()
            debounce = true
            spawntimer(settickets("Spawn timer set to %d minutes"),0)
            return -1
        end

        createtimer("newspawnfix",2000,0)
    end
    
    return -1
end
