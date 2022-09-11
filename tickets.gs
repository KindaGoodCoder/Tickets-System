#include "includes\multiplayer_core.inc"

global scps = [9,SE_INT]
global cd = [2,SE_INT]
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

//Class D Team
cd[1] = 3
cd[0] = 7

//Security
found[0] = 2
found[1] = 1
found[2] = 8
found[3] = 9
found[4] = 4

global playertypes = [127,SE_INT]
global mtfticks, chaosticks, mtftext, chaostext

public def OnScriptLoaded()
    for x = 0; x < 128; x = x + 2 //For every second slot in the list, add possible player number, should support 64 players
        playertypes[x] = x/2 + 1 //Mathmatic genius. The linear equation (yes 100% linear) goes up by 0.5. if u put 1 for x, would be 1.5, if x = 2 than y =  2. Since we're using every second slot we're adding by 2 every time, so for all purposes, we're actually going up by one each time, while keeping the slot after x empty.
    end
end

def roles(plr, role)
    plr = 2*plr - 1 //We do a little maths. We want to reverse the equation from line 35 to give us the slot the playerid is given (fixed), then we want to add 1 to that to find the role value. So y = x/2 + 1 reversed = 2(y-1) = 2y - 2 = x. We want to add one to this equation for the next slot so 2y-2+1 = 2y-1. Therefore 2*plr - 1 equals the slot we require. Thank you for attending my TED Talk
    playertypes[plr] = role 
    print(playertypes[plr])
end

public def OnPlayerGetNewRole(plr, _, role)
    CreateTimer("roles", 5000, 0, plr, role) //make sure it runs after kill detect system
    for plr; plr < 65; plr++
        if IsPlayerConnected(plr) then
            RemovePlayerText(plr, mtftext)
            RemovePlayerText(plr, chaostext) //Remove text on all players screen, shouldnt cause error
            if GetPlayerType(plr) == 0 then //if Spec
                mtftext = CreatePlayerText(plr,"MTF Tickets: " + mtfticks, 250, 300, 255,"Courier New Rus.ttf",40)
                chaostext = CreatePlayerText(plr,"Chaos Tickets: " + chaosticks, 250, 350, 25600, "Courier New Rus.ttf",40) //Show tickets for both teams
            end
        end
    end
end

public def OnPlayerConsole(plr,msg) //bunch of commands to override the old ones
    if msg == "spawnmtf" then
        if mtfticks > 0 then 
            SpawnMTF()
            msg = "[Ignore RCON] MTF Successfully Spawned"
        else
            msg = "[Tickets] Listen to RCON"
        end
        SendMessage(plr, msg)
    end
    if msg == "spawnchaos" then 
        if chaosticks > 0 then
            SpawnChaos()
            msg = "[Ignore RCON] Chaos Successfully Spawned"
        else
            msg = "[Tickets] Listen to RCON"
        end
        SendMessage(plr, msg)
    end
    if msg == "setmtftickets" then
        mtfticks = mtfticks + 5 
    end
    if msg == "setchaostickets" then
        chaosticks = chaosticks + 5
    end
end

public def SpawnMTF()
    mtfticks = Spawn(mtfticks,1)
    local annoucement = OnSpawnMTF() //manually call mtf spawn event
    local pain //false variable to act as a confirmation that OnSpawnMTF did not return a value
    if annoucement == pain then
        annoucement = "SFX\Character\MTF\Announc.ogg"
    end
    Announc(annoucement)
end

def Announc(annoucement)
    for plr; plr < 65; plr++ //play sound for each connected player in server
        if IsPlayerConnected(plr) then
            PlaySound(plr,annoucement)
        end
    end
end

public def SpawnChaos()
    chaosticks = Spawn(chaosticks,7)
    local annoucement = OnSpawnChaos() //Manually call chaos spawn event
    local pain //false variable to act as a confirmation that OnSpawnChaos did not return a value
    if annoucement != pain then
        Announc(annoucement)
    end
end

def Spawn(tickets,role) //Determine spawnwave mechanic
    local specs = [62,SE_INT] //Minus 2 plrs from max players as u need atleast 2 players for a round not to end
    local speccounter = 0
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) == 1 then
            if GetPlayerType(plr) == 0 then
                for space; space < 64; space++
                    if specs[space] == 0 then
                        specs[space] = plr
                        speccounter++
                        break
                    end
                end
            end
        end
    end
    while tickets > 0 and speccounter > 0
        index = rand(1,62)
        plr = specs[index]
        if IsPlayerConnected(plr) == 1 then
            SetPlayerType(plr,role)
            specs[index] = 0
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
    end
    return tickets
end

def wipeout(plr,text)
    if IsPlayerConnected(plr) then
        RemovePlayerText(plr,text)
    end
end

def spawntimer(mins,secs)
    local sec
    if secs < 10 then
        sec = "0"+secs
    else
        sec = secs
    end
    local spawntext = "Next Reinforcement Spawn wave in " + mins + ":" + sec
    if secs == 0 then
        if mins == 0 then
            if chaosticks > mtfticks then //if CI have more tickets, they deserve to spawn first
                SpawnChaos()
            else //if MTF have higher or equal tickets, they spawn. Its their facility, they should be more likely to arrive
                SpawnMTF()
            end
            spawntimer(5,0)
            return
        else
            mins = mins - 1
            secs = 60
        end
    end
    CreateTimer("spawntimer", 1000, 0, mins, secs-1)
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) then
            if GetPlayerType(plr) == 0 then
                sec = CreatePlayerText(plr, spawntext, 15, 60,  123456, "DS-DIGITAL.ttf",50)
                CreateTimer("wipeout",1000, 0, plr, sec)
            end
        end
    end
end

def breakspawn()
    SetChaosTickets(0)
    SetMTFTickets(0)
end

public def OnRoundStarted()
    mtfticks = 5
    chaosticks = 5 //default values for tickets
    CreateTimer("breakspawn",5000,0) //Good luck using the old spawn system without tickets
    SetServerSpawnTimeout(100000000000000) //If tickets does not stop u, good luck waiting that long
    spawntimer(5,0)
end

public def OnPlayerKillPlayer(shooter,shootee)
    local killerrole = GetPlayerType(shooter)
    local role = playertypes[2*shootee-1]
    if killerrole == 7 or killerrole == 3 then         //if CD team
        for y = 0; y < 9;y++
            if found[y] == role or role == 13 then //if died is Security plr or SCP 049-2
                chaosticks++
                break
            end
            if scp[y] == role then //if died is SCP
                print("Good Intel")
                chaosticks = chaosticks + 2
                break
            end
        end
        return
    end
    for y = 0; y < 5;y++ //to loop tho Security role list
        if killerrole == found[y] then
            if role == 7 or role == 13
                print("Hostile terminated")
                mtfticks++
            else
                for scp = 0; scp < 9;scp++
                    if role == scp[y] then
                        mtfticks = mtfticks + 3
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