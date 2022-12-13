function ScriptLoaded() --Server tool will load script regardless of error. If Spawnwaves does not print on ServerLoaded, spawnwave.lua is bugged
    print("SpawnWaves")
end

mtfticks,chaosticks = 0,0

function plr_loop(Run_Function) for plr = 1, 64 do if isplayerconnected(plr) == 1 then Run_Function(plr) end end end
--Input a function which will run for every connected player

function Spawn(tickets,role)
    local speccounter = 0
    local specs = {}

    plr_loop(function(plr)
        if getplayertype(plr) ~= 0 then return end
        
        speccounter = speccounter + 1
        specs[plr] = true
    end)

    if speccounter > 9 then speccounter = 9 end

    while (tickets > 0 and speccounter > 0) do --until tickets=0 or players spawn reach max of 9 operators, run
        local loop = function()
            index = math.random(64) --pick random player
            plr = specs[index]

            if getplayertype(plr) ~= 0 or not plr then return end --In this loop return acts as a continue statement, which doesn't exist in Lua
            
            setplayertype(plr,role)
            tickets = tickets - 1
            speccounter = speccounter - 1
        end
        loop()
    end

    breakspawn() --I dont even know
    return tickets -- Return how many tickets are left
end

function announc(annoucement) plr_loop(function(plr) playsound(plr,annoucement) end); return -1 end

function spawnmtf()
    mtfticks = Spawn(mtfticks,1) -- Call Spawn function and spawn then as role 1 (NTF operator)
    servermessage("Epsilon-11 has entered the facility")
    
    local announcement
    if type(OnSpawnMTF) == "function" then announcement = OnSpawnMTF() -- Lua doesn't like empty functions. U call a function with no definition it errors. but type() is protected.
    else announcement = "SFX/Character/MTF/Announc.ogg" end -- manually call mtf spawn event. If OnSpawnMTF isn't defined by another file, use default sound
    announc(announcement) --announcement
    return -1
end

function spawnchaos()
    chaosticks = Spawn(chaosticks,7)
    servermessage("Chaos Insurgency Strike Team detected")
    
    if type(OnSpawnChaos) == "function" then announc(OnSpawnChaos()) end
    return -1
end

----------------Boredom at its finest---------------
function getmtftickets() return mtfticks end --Returns how many mtf tickets r left

function setmtfticket(ticks) mtfticks = ticks end --Use SetMTFTicket() not SetMTFTickets() cause ticket.lua uses SetMTFTickets()

function getchaostickets() return chaosticks end --Returns how many Chaos Tickets r left

function setchaosticket(ticks) chaosticks = ticks end --Changes how many tickets chaos have. Dont use SetChaosTickets()