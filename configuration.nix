{ config, pkgs, ... }:

{
  # Enable SSH
  services.openssh.enable = true;

  # Add public SSH key for user 'justin'
  users.users.justin = {
    isNormalUser = true;
    home = "/home/justin";
    shell = pkgs.bash;
    openssh.authorizedKeys.keys = [
      "ssh-ed25519 AAAAC3NzaC1lZDI1NTE5AAAAIEKSLX/7JsOftgM+Ti28CGIRoQfxUvFQmdk5vhVqLjJ0"
    ];
  };

  # System packages to install (nodejs for Remix, git, cloudflare-tunnel)
  environment.systemPackages = with pkgs; [
    nodejs
    git
    cloudflare-tunnel
  ];

  # Enable WiFi
  networking.networkmanager.enable = true;

  networking.wireless.enable = true;
  networking.wireless.networks = {
    "I dont feel so good" = {
      psk = "misterstark";
    };
  };

  # Create a systemd service to handle the initial clone and subsequent builds
  systemd.services.remixProject = {
    description = "Clone, build, and start Remix project";
    after = [ "network.target" ];  # Ensure network is up
    wantedBy = [ "multi-user.target" ];

    serviceConfig = {
      ExecStart = ''
        if [ ! -d "/home/justin/Developer" ]; then
          mkdir -p /home/justin/Developer
        fi
        if [ ! -d "/home/justin/Developer/raspberry-pi-server" ]; then
          git clone https://github.com/SomewhatJustin/raspberry-pi-server.git /home/justin/Developer/raspberry-pi-server
        fi
        cd /home/justin/Developer/raspberry-pi-server
        git pull
        npm install
        npm run build
        npm start
      '';
      Restart = "always";
      User = "justin"; # Ensure this matches your user
    };
  };
}
