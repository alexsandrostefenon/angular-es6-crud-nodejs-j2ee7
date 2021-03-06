package org.domain.erp.entity;

import java.math.BigDecimal;
import java.time.LocalDateTime;

import javax.json.bind.annotation.JsonbDateFormat;
import javax.persistence.Column;
import javax.persistence.Entity;
import javax.persistence.GeneratedValue;
import javax.persistence.GenerationType;
import javax.persistence.Id;
import javax.persistence.IdClass;
import javax.persistence.SequenceGenerator;
import javax.persistence.Table;
import javax.validation.constraints.NotNull;

import org.domain.crud.entity.CrudGroupOwnerIdPK;

@IdClass(CrudGroupOwnerIdPK.class)
@Entity
@Table(name = "request")
public class Request {
	@Id
	@Column(name="crud_group_owner")
	private Integer crudGroupOwner;
	@Id
	@SequenceGenerator(name="request_id_seq", sequenceName="request_id_seq", allocationSize=1)
	@GeneratedValue(strategy=GenerationType.SEQUENCE, generator="request_id_seq")
	@Column(columnDefinition="serial")
	private Integer id;
	// Cliente ou Fornecedor
	@NotNull
	private Integer person;
	@NotNull
	@JsonbDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'")
	private LocalDateTime date;
	@NotNull
	private Integer type;// compra, venda/conserto, orçamento, ...
	private Integer state;// esperando resposta do cliente/fornecedor, aguardando entrega/coleta, enviar orçamento, ...
	@Column(name = "additional_data")
	private String additionalData;
	@Column(name = "products_value")
	private BigDecimal productsValue = new BigDecimal(0.0);
	@Column(name = "services_value")
	private BigDecimal servicesValue = new BigDecimal(0.0);
	@Column(name = "transport_value")
	private BigDecimal transportValue = new BigDecimal(0.0);
	@Column(name = "sum_value")
	private BigDecimal sumValue = new BigDecimal(0.0);
	@Column(name = "desc_value")
	private BigDecimal descValue = new BigDecimal(0.0);
	@Column(name = "payments_value")
	private BigDecimal paymentsValue = new BigDecimal(0.0);
	public Integer getId() {
		return id;
	}
	public void setId(Integer id) {
		this.id = id;
	}
	public Integer getPerson() {
		return person;
	}
	public void setPerson(Integer person) {
		this.person = person;
	}
	public LocalDateTime getDate() {
		return date;
	}
	public void setDate(LocalDateTime date) {
		this.date = date;
	}
	public Integer getType() {
		return type;
	}
	public void setType(Integer type) {
		this.type = type;
	}
	public Integer getState() {
		return state;
	}
	public void setState(Integer state) {
		this.state = state;
	}
	public String getAdditionalData() {
		return additionalData;
	}
	public void setAdditionalData(String additionalData) {
		this.additionalData = additionalData;
	}
	public BigDecimal getProductsValue() {
		return productsValue;
	}
	public void setProductsValue(BigDecimal productsValue) {
		this.productsValue = productsValue;
	}
	public BigDecimal getServicesValue() {
		return servicesValue;
	}
	public void setServicesValue(BigDecimal servicesValue) {
		this.servicesValue = servicesValue;
	}
	public BigDecimal getTransportValue() {
		return transportValue;
	}
	public void setTransportValue(BigDecimal transportValue) {
		this.transportValue = transportValue;
	}
	public BigDecimal getSumValue() {
		return sumValue;
	}
	public void setSumValue(BigDecimal sumValue) {
		this.sumValue = sumValue;
	}
	public BigDecimal getPaymentsValue() {
		return paymentsValue;
	}
	public void setPaymentsValue(BigDecimal paymentsValue) {
		this.paymentsValue = paymentsValue;
	}
	public Integer getCrudGroupOwner() {
		return crudGroupOwner;
	}
	public void setCrudGroupOwner(Integer crudGroupOwner) {
		this.crudGroupOwner = crudGroupOwner;
	}
	public BigDecimal getDescValue() {
		return descValue;
	}
	public void setDescValue(BigDecimal descValue) {
		this.descValue = descValue;
	}


}
