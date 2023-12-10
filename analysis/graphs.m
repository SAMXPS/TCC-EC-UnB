clear all;
close all;

data=readmatrix('legacy_mode_data.csv');

time = data(:, 1) / 1000;
averageOfSpeeds = data(:, 2);
singleSpeed = data(:, 3);

f = figure();

subplot(2,1,1);
plot(time, averageOfSpeeds);
title("Modo Legado - Média das velocidades dos veículos");
ylabel("velocidade [km/h]");
xlabel("tempo [s]")
axis([0 120 0 60]);


subplot(2,1,2);
plot(time, singleSpeed);
title("Modo Legado - Velocidade de um dos veículos");
ylabel("velocidade [km/h]");
xlabel("tempo [s]")
axis([0 120 0 60]);


exportgraphics(f,'legacy_mode_data.png')

!############################################

clear all;
close all;

data=readmatrix('colony_mode_data.csv');

time = data(:, 1) / 1000;
averageOfSpeeds = data(:, 2);
singleSpeed = data(:, 3);

f = figure();

subplot(2,1,1);
plot(time, averageOfSpeeds);
title("Modo Colônia - Média das velocidades dos veículos");
ylabel("velocidade [km/h]");
xlabel("tempo [s]")
axis([0 120 0 60]);


subplot(2,1,2);
plot(time, singleSpeed);
title("Modo Colônia - Velocidade de um dos veículos");
ylabel("velocidade [km/h]");
xlabel("tempo [s]")
axis([0 120 0 60]);


exportgraphics(f,'colony_mode_data.png')