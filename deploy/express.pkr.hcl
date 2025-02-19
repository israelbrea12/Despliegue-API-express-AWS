packer {
  required_plugins {
    amazon = {
      source  = "github.com/hashicorp/amazon"
      version = "~> 1.0"
    }
  }
}

variable "aws_access_key" {
  type    = string
  default = ""
}

variable "aws_secret_key" {
  type    = string
  default = ""
}

variable "express_version" {
  type    = string
  default = "1.0-SNAPSHOT"
}

source "amazon-ebs" "ubuntu-express" {
  access_key    = var.aws_access_key
  secret_key    = var.aws_secret_key
  region        = "eu-west-1"
  source_ami    = "ami-03fd334507439f4d1"
  instance_type = "t3.micro"
  ssh_username  = "ubuntu"
  ami_name      = "express-app"
}


build {
  sources = ["source.amazon-ebs.ubuntu-express"]

  provisioner "file" {
    source      = "express.service"
    destination = "/home/ubuntu/"
  }

  provisioner "file" {
    source      = "../target/universal/express.zip"
    destination = "/home/ubuntu/express.zip"
  }

  provisioner "shell" {
    inline = [
      "sleep 30",
      "sudo apt-get update",
      "sudo apt-get update && sudo apt upgrade -y",
      "sudo apt-get install -y nodejs npm unzip",
      "unzip /home/ubuntu/express.zip",
      "npm install",
      "sudo apt update",
      "sudo apt install mysql-server -y",
      "sudo systemctl start mysql",
      "sudo mysql -e "CREATE DATABASE IF NOT EXISTS express DEFAULT CHARACTER SET utf8 COLLATE utf8_general_ci;"",
      "sudo mysql -e "ALTER USER 'root'@'localhost' IDENTIFIED WITH mysql_native_password BY 'root'; FLUSH PRIVILEGES;"",
      "sudo cp /home/ubuntu/express.service /etc/systemd/system",
      "sudo systemctl daemon-reload",
      "sudo systemctl enable express.service",
    ]
  }
}