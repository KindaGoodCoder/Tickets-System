require "Tickets-System/spawnwave"

playertypes = {} -- List to hold all player roles. Playerid will be used as index for the list. The value of the index is the player's role

scps = {5,6,10,11,12,13,14,15,16} --Team roles
found = {1,2,4,8,9,0,0,0,0}

mtftext, chaostext = 0

debounce = false

function OnScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, tickets.gs is bugged
    print("Tickets")
    ScriptLoaded()
    return -1
end

function plr_loop(Run_Fuction) for plr = 1, 64 do if isplayerconnected(plr) == 1 then Run_Fuction(plr) end end end 
--Input a function which will run for every connected player

function OnPlayerGetNewRole(player,_,role)
    if type(player) == "number" then
        roles = function()

            playertypes[player] = role --Add their role to the list under the playerid

            plr_loop(function(plr)
                if isplayerconnected(plr) == 1 then
                    removeplayertext(plr, chaostext) --Remove text on all players screen, shouldnt cause error
                    removeplayertext(plr, mtftext)

                    if getplayertype(plr) == 0 then --if Spec
                        role = getplayermonitorwidth(plr)/2.56 -- Use these variable that have no purpose now
                        player = getplayermonitorheight(plr)
                        mtftext = createplayertext(plr,"MTF Tickets: "..mtfticks, role, player/1.6, 255,"Courier New Rus.ttf",40)
                        chaostext = createplayertext(plr,"Chaos Tickets: "..chaosticks, role, player/1.3, 25600, "Courier New Rus.ttf",40) --Show tickets for both teams
                    end
                end
                
            end) --Tickets display... works better on a delay

            return -1
        end

        createtimer("roles",4000,0)
    end

    return -1
end

function OnPlayerConnect() OnPlayerGetNewRole(); return -1 end

function OnPlayerKillPlayer(shooter,shootee)
    print("death")
    local killerrole = getplayertype(shooter)
    local role = playertypes[shootee] --find shootee role from list
    if killerrole == 7 or killerrole == 3 then --if CD team
        print("pain")
        for y = 1, 9 do
            if role == found[y] or role == 13 then chaosticks = chaosticks + 1; break -- If died is Security plr or SCP 049-2
            elseif role == scps[y] then chaosticks = chaosticks + 2; break end --if died is SCP
        end        

    else

        for y = 1, 5 do --to loop tho Security role list

            if killerrole == found[y] then

                if role == 7 or role == 13 then mtfticks = mtfticks + 1 --Dont get tickets for killing innocent Class D
                else 
                    for scp = 0, 9 do 
                        if role == scps[y] then 
                            mtfticks = mtfticks + 3
                            break 
                        end 
                    end 
                end
                --They can get paid now
                break --break the y loop

            end
        end
    end
    return -1
end

function OnPlayerEscape(_,escaped) 
    if escaped == 7 then chaosticks = chaosticks + 2
    elseif escaped == 1 then mtfticks = mtfticks + 2 end
    return -1
end

function spawntimer(mins,secs) --looks familiar. Creates a timer which at end of spawns team with most tickets.
    if debounce then
        mins,secs = tonumber(mins),tonumber(secs)        
        local sec

        if secs < 10 then sec = "0"..secs--declare display variable
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
            if getplayertype(plr) == 0 then
                local screen_width = getplayermonitorwidth(plr)
                local screen_height = getplayermonitorheight(plr)
                sec = createplayertext(plr, spawntext, screen_width/45, screen_height/8,  123456, "DS-DIGITAL.ttf",50) -- text to wipe
                createtimer("wipeout",1000,0,plr,sec)
            end
        end)

    end

    return -1
end

function spawnwave()
    if chaosticks > mtfticks then spawnchaos() else spawnmtf() end
end

function spawnfix()
    debounce = true
    spawntimer(5,0)
    print("Die")
    return -1
end

function OnActivateWarheads() debounce = false; return -1 end --All units retreat, alpha warheads activated.    

function OnServerRestart() debounce = false; return -1 end --If the server for some reason doesnt activate warheads before restarting, disable spawn anyway

function OnDeactivateWarheads() spawnfix(); return -1 end --All units return, warheads disabled    

function OnRoundStarted()
    breakspawn = function() setmtftickets(0); setchaostickets(0); return -1 end
    mtfticks = 24
    chaosticks = 18 --default values for tickets
    createtimer("breakspawn",5000,0) --Good luck using the old spawn system without tickets
    setserverspawntimeout(100000000000000) --If tickets does not stop u, good luck waiting that long
    spawnfix() --start spawn timer
    return -1
end

--------Commands------------
function OnPlayerConsole(plr,msg) --bunch of commands to override the old ones
    function spawncommand(team)
        local txt, tickets
        print("spawn"..team)

        if team == "mtf" then tickets = mtfticks
        else tickets = chaosticks end

        if tickets > 0 then
            debounce = false
            createtimer("spawn"..team.."s",0,0) --Easier to set spawnwave as string
            createtimer("spawnfix",2000,0)
            print("k")
            txt = string.format("[Ignore RCON] %s Successfully Spawned",team)
        else txt = "[Tickets] Listen to RCON" end

        sendmessage(plr, txt)
    end

    local select = {
        ["spawnmtf"] = function() spawncommand("mtf") end,
        ["spawnchaos"] = function() spawncommand("chaos") end,
        ["setmtftickets"] = function() mtfticks = mtfticks + 5 end,
        ["setchaostickets"] = function() chaosticks = chaosticks + 5 end,
        ["spawnwave"] = function()
            debounce = false
            if chaosticks > mtfticks then spawncommand("Chaos")
            else spawncommand("MTF") end
        end
    }
    if type(select[string.lower(msg)]) == "function" then select[string.lower(msg)]() end

    return -1
end