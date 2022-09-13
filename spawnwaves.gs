#include "includes\multiplayer_core.inc"

public mtfticks,chaosticks //tickets for each team. Used by tickets.gs

public def SpawnMTF()
    mtfticks = Spawn(mtfticks,1) //Call Spawn function and spawn then as role 1 (NTF operator)
    local annoucement = OnSpawnMTF() //manually call mtf spawn event
    local pain //false variable to act as a confirmation that OnSpawnMTF did not return a value
    if annoucement == pain then //if no value, use default annoucement
        annoucement = "SFX\Character\MTF\Announc.ogg"
    end
    Announc(annoucement) //annoucement
end

def Announc(annoucement)
    for plr; plr < 65; plr++ //play sound for each connected player in server
        if IsPlayerConnected(plr) then
            PlaySound(plr,annoucement)
        end
    end
end

public def SpawnChaos()
    chaosticks = Spawn(chaosticks,7) //Call Spawn function and spawn then as role 7 (CI Soldier)
    local annoucement = OnSpawnChaos() //Manually call chaos spawn event
    local pain //false variable to act as a confirmation that OnSpawnChaos did not return a value
    if annoucement != pain then //if spawnchaos had a value play it
        Announc(annoucement)
    end
end

def Spawn(tickets,role) //Determine spawnwave mechanic
    local specs = [62,SE_INT] //Minus 2 plrs from max players as u need atleast 2 players for a round not to end
    local speccounter = 0 
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) == 1 then
            if GetPlayerType(plr) == 0 then //if spectator
                for space; space < 64; space++ 
                    if specs[space] == 0 then //add to list
                        specs[space] = plr
                        speccounter++ //Count spectators
                        break
                    end
                end
            end
        end
    end
    while tickets > 0 and speccounter > 0 //until tickets or spectators = 0, run
        index = rand(1,62) //pick random player
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

//Got bored so decided to keep the ticket function functionality 
public def GetMTFTickets()
    return mtfticks
end

public def SetMTFTicket(ticks)
    mtfticks = ticks
end

public def GetChaosTickets()
    return chaosticks
end

public def SetChaosTicket(ticks)
    chaosticks = ticks
end