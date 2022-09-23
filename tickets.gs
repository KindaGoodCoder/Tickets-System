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

global playertypes = [65,SE_INT]
global mtftext, chaostext
global debounce = false

def roles(plr, role)
    playertypes[plr] = role
    print(playertypes[plr])
end

public def OnPlayerConnect(plr)
    OnPlayerGetNewRole(plr,_,0) //too lazy to make a new function so imma use the callback myself
end

public def OnPlayerGetNewRole(plr, _, role)
    CreateTimer("roles", 2000, 0, plr, role) //make sure it runs after kill detect system
    for player = 1; player < 65; player++
        if IsPlayerConnected(player) == 1 then
            RemovePlayerText(player, chaostext) //Remove text on all players screen, shouldnt cause error
            RemovePlayerText(player, mtftext)            
            if GetPlayerType(player) == 0 then //if Spec
                mtftext = CreatePlayerText(player,"MTF Tickets: " + mtfticks, 250, 300, 255,"Courier New Rus.ttf",40)
                chaostext = CreatePlayerText(player,"Chaos Tickets: " + chaosticks, 250, 350, 25600, "Courier New Rus.ttf",40) //Show tickets for both teams
            end
        end
    end
end

def spawnfix() //convience
    debounce = True
    spawntimer(5,0)
end

def spawnwave()
    if chaosticks > mtfticks then //if CI have more tickets, they deserve to spawn first
        SpawnChaos()
    else //if MTF have higher or equal tickets, they spawn. Its their facility, they should be more likely to arrive
        SpawnMTF()
    end
end

def spawncommand(plr,team)
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
        spawncommand(plr,"MTF")
    end
    if msg == "spawnchaos" then 
        spawncommand("Chaos")
    end
    if msg == "setmtftickets" then
        mtfticks = mtfticks + 5 
        SetMTFTickets(0)
    end
    if msg == "setchaostickets" then
        chaosticks = chaosticks + 5
        SetChaosTickets(0) //make sure default spawn system doesnt create tickets
    end
    if msg == "spawnwave" then
        debounce = False
        spawnwave()
        if mtfticks+chaosticks == 0 Then
            msg = "[RCON] Neither team has tickets"
        else
            msg = "[Ignore RCON] Team Successfully Spawned"
        end
        SendMessage(plr, msg)
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

def spawntimer(mins,secs) //looks familiar. Creates a timer which at end of spawns team with most tickets.
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
            spawntimer(5,0)
            return //timer finished
        else //if mins didnt equal 0, then a minute passed , subtract 1 from min and reset secs
            mins = mins - 1
            secs = 60
        end
    end    
    CreateTimer("spawntimer", 1000, 0, mins, secs-1) //restart function with secs - 1 
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) then //for each connected plr
            if GetPlayerType(plr) == 0 then
                sec = CreatePlayerText(plr, spawntext, 15, 60,  123456, "DS-DIGITAL.ttf",50) // text to wipe
                CreateTimer("wipeout",1000,0,plr,sec)
            end
        end
    end
end

def breakspawn() //Destroy old spawn
    SetChaosTickets(0)
    SetMTFTickets(0)
end //Have to set it up as a delay since round changes it to default sometime after round start

public def OnRoundStarted()
    mtfticks = 18
    chaosticks = 12 //default values for tickets
    CreateTimer("breakspawn",5000,0) //Good luck using the old spawn system without tickets
    SetServerSpawnTimeout(100000000000000) //If tickets does not stop u, good luck waiting that long
    spawnfix() //start spawn timer
end

public def OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetPlayerType(shooter)
    local role = playertypes[shootee] //find ded role from list
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
        return //end it
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