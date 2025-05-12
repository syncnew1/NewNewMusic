package com.music.newnewmusic;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.autoconfigure.domain.EntityScan;
import org.springframework.data.jpa.repository.config.EnableJpaRepositories;
import org.springframework.boot.autoconfigure.jdbc.DataSourceAutoConfiguration;
import org.springframework.boot.autoconfigure.orm.jpa.HibernateJpaAutoConfiguration;

@SpringBootApplication
@EntityScan("com.music.newnewmusic.model")
@EnableJpaRepositories("com.music.newnewmusic.repository")
public class NewNewMusicApplication {

    public static void main(String[] args) {
        SpringApplication.run(NewNewMusicApplication.class, args);
    }

}
