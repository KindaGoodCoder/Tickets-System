function ScriptLoaded() --Server tool will load script regardless of error. If Tickets does not print on ServerLoaded, spawnwave.gs is bugged
    print("SpawnWaves")
end

mtfticks,chaosticks = 0,0


function Spawn(tickets,role)
    local specs = {}
    local speccounter = 0 --count the ded

    plr_loop(function(plr)
        if getplayertype(plr) == 0 then --if spectator
            specs[plr] = true
            speccounter = speccounter + 1
        end
    end)

    if speccounter > 9 then speccounter = 9 end -- Max 9 operators. End loop

    while (tickets > 0 and speccounter > 0) do --until tickets or spectators = 0, run
        plr = math.random(65) --pick random player
        index = specs[plr]
        if isplayerconnected(plr) == 1 and index == true then
            setplayertype(plr,role)
            specs[plr] = false
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
    end

    breakspawn() --I dont even know
    return tickets
end

function announc(annoucement) plr_loop(function(plr) playsound(plr,annoucement) end); return -1 end

function spawnmtf()
    mtfticks = Spawn(mtfticks,1) -- Call Spawn function and spawn then as role 1 (NTF operator)
    servermessage("Epsilon-11 has entered the facility")
    local announcement
    if type(OnSpawnMTF) == "function" then announcement = OnSpawnMTF(); print("i")
    else announcement = "SFX/Character/MTF/Announc.ogg" end-- manually call mtf spawn event
    announc(announcement) --announcement    
    print(announcement)
    return -1
end

function spawnchaos()
    chaosticks = Spawn(chaosticks,7)
    servermessage("Chaos Insurgency Strike Team detected")
    if type(OnSpawnChaos) == "function" then Announc(OnSpawnChaos()) end
    return -1
end

----------------Boredom at its finest---------------
function getmtftickets() return mtfticks end--Returns how many mtf tickets r left

function setmtfticket(ticks) mtfticks = ticks end--Use SetMTFTicket() not SetMTFTickets() cause ticket.gs uses SetMTFTickets()    

function getchaostickets() return chaosticks end--Returns how many Chaos Tickets r left    

function setchaosticket(ticks) chaosticks = ticks end --Changes how many tickets chaos have. Dont use SetChaosTickets()    