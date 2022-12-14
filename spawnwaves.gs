//File to hold public functions for ticket.gs. Include this file if you wish to maintain functionality of SpawnMTF() or SpawnChaos().

public mtfticks,chaosticks //tickets for each team. Used by tickets.gs

public def SpawnMTF()
    mtfticks = Spawn(mtfticks,1) //Call Spawn function and spawn then as role 1 (NTF operator)
    ServerMessage("Epsilon-11 has entered the facility")
    local annoucement = OnSpawnMTF() //manually call mtf spawn event
    if not annoucement then annoucement = "SFX\Character\MTF\Announc.ogg"//if no value, use default annoucement
    Announc(annoucement) //annoucement
end

def Announc(annoucement)
    for plr = 1; plr < 65; plr++ //play sound for each connected player in server        
        if IsPlayerConnected(plr) == 1 then PlaySound(plr,annoucement)
    end
end

public def SpawnChaos()
    chaosticks = Spawn(chaosticks,7) //Call Spawn function and spawn then as role 7 (CI Soldier)
    ServerMessage("Chaos Soldiers have breached the facility")
    local annoucement = OnSpawnChaos() //Manually call chaos spawn event
    if annoucement then Announc(annoucement)//if spawnchaos had a value play it        
end

def Spawn(tickets,role) // spawnwave mechanic
    local specs = [65,SE_INT]
    local speccounter = 0 //count the ded
    for plr = 1; plr < 65; plr++
        if IsPlayerConnected(plr) == 1 then
            if GetPlayerType(plr) == 0 then //if spectator
                specs[plr] = true; speccounter++
            end
        end
    end
    while tickets > 0 and speccounter > 0 //until tickets or spectators = 0, run
        plr = rand(0,65) //pick random player
        index = specs[plr]
        if IsPlayerConnected(plr) == 1 and index == true then
            SetPlayerType(plr,role)
            specs[plr] = false
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
    end
    return tickets
end

//Got bored so decided to keep the ticket function functionality 
public def GetMTFTickets() //Returns how many mtf tickets r left
    return mtfticks
end

public def SetMTFTicket(ticks) //Use SetMTFTicket() not SetMTFTickets() cause ticket.gs uses SetMTFTickets()
    mtfticks = ticks
end

public def GetChaosTickets() //Returns how many Chaos Tickets r left
    return chaosticks
end

public def SetChaosTicket(ticks) //Changes how many tickets chaos have. Dont use SetChaosTickets()
    chaosticks = ticks
end