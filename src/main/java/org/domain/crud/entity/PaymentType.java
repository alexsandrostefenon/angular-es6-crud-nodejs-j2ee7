package org.domain.crud.entity;
// Generated 08/10/2015 20:06:22 by Hibernate Tools 4.3.1

import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.persistence.UniqueConstraint;
import javax.xml.bind.annotation.XmlRootElement;

/**
 * TaxOpcode generated by hbm2java
 */
@Entity
@Table(name = "payment_type", uniqueConstraints = @UniqueConstraint(columnNames = "name"))
@XmlRootElement
public class PaymentType implements java.io.Serializable {

	/**
	 * 
	 */
	private static final long serialVersionUID = 1864551567293374642L;
	@Id
	@SequenceGenerator(name="payment_type_id_seq", sequenceName="payment_type_id_seq", allocationSize=1)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="payment_type_id_seq")
	@Column(columnDefinition="serial")
	private Integer id;
	private String name;
	private String description;

	public Integer getId() {
		return this.id;
	}

	public void setId(Integer id) {
		this.id = id;
	}

	@Column(name = "name", unique = true, nullable = false)
	public String getName() {
		return this.name;
	}

	public void setName(String name) {
		this.name = name;
	}

	@Column(name = "description", length = 100)
	public String getDescription() {
		return this.description;
	}

	public void setDescription(String description) {
		this.description = description;
	}

}
