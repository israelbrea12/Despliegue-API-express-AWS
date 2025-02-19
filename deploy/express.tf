variable "ami_id" {
  type    = string
  default = ""
}

provider "aws" {
  region = "eu-south-2"
  skip_region_validation = true
}

data "aws_vpc" "default" {
  default = true
}

data "aws_subnets" "default" {
  filter {
    name   = "vpc-id"
    values = [data.aws_vpc.default.id]
 }
}

resource "aws_security_group" "instance" {
  name = "agenda"

  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    security_groups = [aws_security_group.agenda_alb.id]
  }
}

resource "aws_launch_template" "agenda" {
  name          = "agenda-template"
  image_id      = var.ami_id
  instance_type = "t3.micro"
  key_name = "mimo-cloud-teacher"
  block_device_mappings {
    device_name = "/dev/sda1"
    ebs {
      volume_size = 20
      volume_type = "gp2"
    }
  }

  network_interfaces {
    associate_public_ip_address = true
    security_groups = [aws_security_group.instance.id]
  }

  tag_specifications {
    resource_type = "instance"
    tags = {
      Name = "agenda-app"
    }
  }
}

resource "aws_autoscaling_group" "agenda_asg" {
  launch_template {
    id      = aws_launch_template.agenda.id
  }
  vpc_zone_identifier = data.aws_subnets.default.ids

  target_group_arns = [aws_lb_target_group.agenda_tg.arn]
  health_check_type = "ELB"

  min_size = 2
  desired_capacity = 3
  max_size = 6

  tag {
    key = "Name"
    value = "agenda-asg"
    propagate_at_launch = true
  }
}

resource "aws_lb" "agenda_lb" {
  name = "agenda"
  load_balancer_type = "application"
  subnets = data.aws_subnets.default.ids
  security_groups = [aws_security_group.agenda_alb.id]
}

resource "aws_lb_listener" "http" {
  load_balancer_arn = aws_lb.agenda_lb.arn
  port = 80
  protocol = "HTTP"

  default_action {
    type = "fixed-response"

    fixed_response {
      content_type = "text/plain"
      message_body = "Page Not Found"
      status_code = 404
    }
  }
}

resource "aws_security_group" "agenda_alb" {
  name = "agenda-alb"
  
  ingress {
    from_port = 80
    to_port = 80
    protocol = "tcp"
    cidr_blocks = ["0.0.0.0/0"]
  }

  egress {
      from_port = 0
      to_port = 0
      protocol = "-1"
      cidr_blocks = ["0.0.0.0/0"]
  }
}

resource "aws_lb_target_group" "agenda_tg" {
  name = "agenda-tg"
  port = 80
  protocol = "HTTP"
  vpc_id = data.aws_vpc.default.id

  health_check {
    path = "/health"
    protocol = "HTTP"
    matcher = "200"
    interval = 15
    timeout = 5
    healthy_threshold = 3
    unhealthy_threshold = 3
  }
}

resource "aws_lb_listener_rule" "asg" {
  listener_arn = aws_lb_listener.http.arn
  priority = 100

  condition {
    path_pattern {
      values = ["*"]
    }
  }

  action {
    type = "forward"
    target_group_arn = aws_lb_target_group.agenda_tg.arn
  }
}

output "agenda_alb_dns_name" {
  value = aws_lb.agenda_lb
  description = "Domain name of the Agenda App ALB"
}