#include "includes\multiplayer_core.inc"
#include "spawnwaves.gs"

global scps = [9,SE_INT]
global found = [5,SE_INT]
//tickets

//SCPs (Excluding 049-2 cause its "special")
scps[1] = 5
scps[2] = 6
scps[3] = 10
scps[4] = 11
scps[5] = 12
scps[7] = 14
scps[0] = 15
scps[6] = 16 

//Security
found[0] = 2
found[1] = 1
found[2] = 8
found[3] = 9
found[4] = 4

//No need for CD team list since only 2 roles

global playertypes = [127,SE_INT]
global mtftext, chaostext
global debounce = false

public def OnScriptLoaded()
    for x = 0; x < 128; x = x + 2 //For every second slot in the list, add possible player number, should support 64 players
        playertypes[x] = x/2 + 1 //Mathmatic genius. The linear equation (yes 100% linear) goes up by 0.5. if u put 1 for x, would be 1.5, if x = 2 than y =  2. Since we're using every second slot we're adding by 2 every time, so for all purposes, we're actually going up by one each time, while keeping the slot after x empty.
    end
end

def roles(plr, role)
    plr = 2*plr - 1 //We do a little maths. We want to reverse the equation from line 35 to give us the slot the playerid is given (fixed), then we want to add 1 to that to find the role value. So y = x/2 + 1 reversed = 2(y-1) = 2y - 2 = x. We want to add one to this equation for the next slot so 2y-2+1 = 2y-1. Therefore 2*plr - 1 equals the slot we require. Thank you for attending my TED Talk
    playertypes[plr] = role 
    print(playertypes[plr])
    for player; player < 65; player++
        if IsPlayerConnected(player) then
            RemovePlayerText(player, chaostext) //Remove text on all players screen, shouldnt cause error
            RemovePlayerText(player, mtftext)            
            if GetPlayerType(player) == 0 then //if Spec
                mtftext = CreatePlayerText(player,"MTF Tickets: " + mtfticks, 250, 300, 255,"Courier New Rus.ttf",40)
                chaostext = CreatePlayerText(player,"Chaos Tickets: " + chaosticks, 250, 350, 25600, "Courier New Rus.ttf",40) //Show tickets for both teams
            end
        end
    end
end

public def OnPlayerGetNewRole(plr, _, role)
    CreateTimer("roles", 1000, 0, plr, role) //make sure it runs after kill detect system
end

def spawnfix()
    debounce = True
    spawntimer(5,0)
end

def spawnwave()
    if chaosticks > mtfticks then //if CI have more tickets, they deserve to spawn first
        SpawnChaos()
    else //if MTF have higher or equal tickets, they spawn. Its their facility, they should be more likely to arrive
        SpawnMTF()
    end
    spawntimer(5,0)
end

def spawncommand(team)
    local msg, tickets
    if team == "MTF" then
        tickets = mtfticks        
    else
        tickets = chaosticks
    end
    local spawnfunction = "Spawn" + team
    if tickets > 0 then 
        debounce = False
        CreateTimer(spawnfunction,0,0) //Easier to set spawnwave as string
        CreateTimer("spawnfix",1000,0)
        msg = "[Ignore RCON] " + team +" Successfully Spawned"
    else
        msg = "[Tickets] Listen to RCON"
    end
    SendMessage(plr, msg)
end

public def OnPlayerConsole(plr,msg) //bunch of commands to override the old ones
    if msg == "spawnmtf" then
        spawncommand("MTF")
    end
    if msg == "spawnchaos" then 
        spawncommand("Chaos")
    end
    if msg == "setmtftickets" then
        mtfticks = mtfticks + 5 
    end
    if msg == "setchaostickets" then
        chaosticks = chaosticks + 5
    end
    if msg == "spawnwave" then
        debounce = False
        spawnwave()
        CreateTimer("spawnfix",1000,0)
    end
end

public def OnActivateWarheads() //All units retreat, alpha warheads activated.
    debounce = false
end

public def OnServerRestart() //If the server for some reason doesnt activate warheads before restarting, disable spawn anyway
    debounce = false
end

public def OnDeactivateWarheads() //All units return, warheads disabled
    spawnfix()
end

def wipeout(plr,text)
    if IsPlayerConnected(plr) then
        RemovePlayerText(plr,text)
    end
end

def spawntimer(mins,secs)
    if debounce == false then
        return
    end
    local sec
    if secs < 10 then //declare display variable
        sec = "0"+secs
    else
        sec = secs
    end
    local spawntext = "Next Reinforcement Spawn wave in " + mins + ":" + sec //Reinforcement timer text
    if secs == 0 then
        if mins == 0 then //if mins and secs = 0, timer finished
            spawnwave()
            return
        else //if mins didnt equal 0, then a minute passed , subtract 1 from min and reset secs
            mins = mins - 1
            secs = 60
        end
    end    
    CreateTimer("spawntimer", 1000, 0, mins, secs-1) //restart function with secs - 1 
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) then //for each connected plr
            if GetPlayerType(plr) == 0 then
                sec = CreatePlayerText(plr, spawntext, 15, 60,  123456, "DS-DIGITAL.ttf",50) // global textpointer to disable
                CreateTimer("wipeout",1000,0,plr,sec)
            end
        end
    end
end

def breakspawn() //Destroy old spawn function
    SetChaosTickets(0)
    SetMTFTickets(0)
end //Have to set it up as a delay since round changes it to default sometime after round start

public def OnRoundStarted()
    mtfticks = 18
    chaosticks = 12 //default values for tickets
    CreateTimer("breakspawn",5000,0) //Good luck using the old spawn system without tickets
    SetServerSpawnTimeout(100000000000000) //If tickets does not stop u, good luck waiting that long
    debounce = true
    spawntimer(5,0) //start spawn timer
end

public def OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetPlayerType(shooter)
    local role = playertypes[2*shootee-1] //find ded role from list
    if killerrole == 7 or killerrole == 3 then //if CD team
        for y = 0; y < 9;y++
            if found[y] == role or role == 13 then //if died is Security plr or SCP 049-2
                chaosticks++ //add ci ticket
                break
            end
            if scps[y] == role then //if died is SCP
                print("Good Intel")
                chaosticks = chaosticks + 2 //good job CI
                break
            end
        end
        return
    end
    for y = 0; y < 5;y++ //to loop tho Security role list
        if killerrole == found[y] then
            if role == 7 or role == 13 then //Dont get tickets for killing innocent Class D
                print("Hostile terminated")
                mtfticks++ //Traitor
            else
                for scp = 0; scp < 9;scp++
                    if role == scps[y] then
                        mtfticks = mtfticks + 3 //They can get paid now
                        break
                    end
                end
            end
            return //break the y loop
        end
    end
end

public def OnPlayerEscape(__, escaped) //Deserves tickets for escaping. Its +2 to encourage capture by reinforcements. U get more tickets from capturing then killing
    if escaped == 7 then
        chaosticks = chaosticks + 2
    end
    if escaped == 1 then
        mtfticks = mtfticks + 2
    end
end